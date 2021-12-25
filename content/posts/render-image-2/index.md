---
title: "Hugo: imgタグにwidth, height属性を追加"
date: 2021-12-25T14:11:39+09:00
draft: false
keywords: "Hugo, ブログ, 画像, Mardown Render Hooks, Width, Height"
tags: ["Hugo", "ブログ", "画像", "Mardown Render Hooks", "JamStack"]
featured_image: '/posts/render-image-2/image.webp'
---

Hugoで記事を作成する際に、[Markdown Render Hooksを使ってimgタグにLazy Loading属性を追加する方法](posts/render-image "Markdown Render Hooksを使ってimgタグにLazy Loading属性を追加する方法")を書きましたが、今回は画像のサイズを取得して`width`属性と`height`属性を追加してみます。

## Markdown Render Hooksのおさらい

`layout/_default/_markup`フォルダに`render-image.html`という名前でテンプレートファイルを作成すると、このテンプレートを使い`img`タグへ変換してくれる機能です。`image`意外に`link`と`heading`のHooksがあります。



```html
<!-- layouts/_default/_markup/render-image.html -->
<img src="{{ .Destination | safeURL }}" alt="{{ .Text }}" loading="lazy" />
```

## imageConfigで画像の情報を取得

Hugoのテンプレートには、画像ファイルの幅、高さ、カラーモデルを取得する`imageConfig`という関数が用意されています。

[Hugoの公式ページ](https://gohugo.io/functions/images/)に紹介されている使い方の例を引用します。

```go
{{ with (imageConfig "favicon.ico") }}
favicon.ico: {{.Width}} x {{.Height}}
{{ end }}
```

これをMarkdown Render Hooksの`render-image.html`内で使う際に、画像のパスが少々やっかいで躓いたので以下に注意点と自分が試行錯誤した設定を紹介します。もっとスマートな方法もありそうなのでより良い方法がありそうな気がします。

## 画像がcontentフォルダにある場合

画像ファイルへのパスは、`.Page.RelPermalink (.Destination | safeURL)`で取得できますが、このパスには、一番頭になるcontentフォルダの名前が含まれていません。なので、contentフォルダ名を追加して変数`$contentImage`にパスを設定しています。

そして`$contentImage`を引数として`imageConfig`関数の結果を`$imgcnf`変数に入れています。

```go
{{ $contentImage := path.Join "/content" .Page.RelPermalink (.Destination | safeURL) }}
{{ $imgcnf = imageConfig $contentImage }}
```

あとは`$imgconf`から`.Width`、`.Height`でそれぞれ画像の幅、高さが取得できます。

```go
<img class="h-auto"
  src="{{ .Destination | safeURL }}"
  alt="{{ .Text }}"
  loading="lazy"
{{ with $imgcnf }}
  width="{{ .Width }}"
  height="{{ .Height }}"
{{ end }}
/>
```

## 画像がstaticフォルダにある場合

画像がstaticフォルダにある場合は、基本的にはcontentフォルダにある場合と同じですが、ページリソースの`.Page.RelPermalink`は使えないため、パスの作り方が少し異なります。

```go
{{ $staticImage := path.Join "/static" (.Destination | safeURL) }}
```

さて、画像ファイルがどちらのフォルダにあるかはわからないので、力技で両方のパスを作り、`fileExists`関数でファイルが存在する方を`$imgcnf`変数に入れるようにしました。

```go
{{ $contentImage := path.Join "/content" .Page.RelPermalink (.Destination | safeURL) }}
{{ $staticImage := path.Join "/static" (.Destination | safeURL) }}
{{ $imgcnf := "" }}
{{ if fileExists $contentImage }}
{{ $imgcnf = imageConfig $contentImage }}
{{ else if fileExists $staticImage }}
{{ $imgcnf = imageConfig $staticImage }}
{{ end }}
```

## SVGファイルは除く

ここまでで概ねうまく動きましたが、画像ファイルとしてSVGファイルを使用していたところでエラーが出てしまいました。SVGファイルもファイル内でサイズを指定できるようなのでもしかすると幅、高さを取得する方法はあるのではないかと思いますが、ここではシンプルにSVGファイルの幅、高さは取得しないことで回避しました。

SVGファイルかどうかを調べるのは、正規表現でパスの語尾が`.svg`で終わるかどうかで判断しています。うーん、もっと良い方法がありそうですが（汗）。

先程の`if`文の条件判定にSVGかの判定を追加して下記のようにしました。

```go
{{ if and (fileExists $contentImage) (not (findRE `.svg$` $contentImage)) }}
{{ $imgcnf = imageConfig $contentImage }}
{{ else if and (fileExists $staticImage) (not (findRE `.svg$` $contentImage)) }}
{{ $imgcnf = imageConfig $staticImage }}
{{ end }}
```

## render-image.htmlのサンプル

最終的に`render-image.html`の中身は下記になりました。

```go
<!-- layouts/_default/_markup/render-image.html -->
{{ $contentImage := path.Join "/content" .Page.RelPermalink (.Destination | safeURL) }}
{{ $staticImage := path.Join "/static" (.Destination | safeURL) }}
{{ $imgcnf := "" }}
{{ if and (fileExists $contentImage) (not (findRE `.svg$` $contentImage)) }}
{{ $imgcnf = imageConfig $contentImage }}
{{ else if and (fileExists $staticImage) (not (findRE `.svg$` $contentImage)) }}
{{ $imgcnf = imageConfig $staticImage }}
{{ end }}
<img class="h-auto"
  src="{{ .Destination | safeURL }}"
  alt="{{ .Text }}"
  loading="lazy"
{{ with $imgcnf }}
  width="{{ .Width }}"
  height="{{ .Height }}"
{{ end }}
/>
```

## まとめ

Hugoで記事を作成する際、Markdown Render Hooksを使い画像の幅と高さを`img`タグに入れることができました！

まだまだGo Templeteの書式には慣れず、HugoのTemplateについても理解できていない部分が多いですが、少しずつ機能を使いこなしていきたいと思います！
