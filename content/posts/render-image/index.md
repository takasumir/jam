---
title: "Hugo: 画像の遅延読込み(Lazy Loading)"
date: 2021-12-25T06:41:15+09:00
draft: false
keywords: "Hugo, ブログ, 画像, Mardown Render Hooks, Lasy Loading"
tags: ["Hugo", "ブログ", "画像", "Mardown Render Hooks", "JamStack"]
featured_image: '/posts/render-image/lazyloading.webp'
---

ブログなどで画像を多用する場合、一度に画像を全部ダウンロードするとページの読み込みが遅くなってしまいます。最近のブラウザには解決策としてLasy Loadingという機能があります。ブラウザの表示範囲外の画像はダウンロードを保留し、ユーザーがページをスクロールして画像のところまで来たらダウンロード、表示することでページの表示速度を向上させます。

## HTMLタグでLasy Loadingの指定方法

以前はJavaScriptライブラリを使う必要がありましたが、最近のブラウザでは`img`タグに`loading='lazy'`属性を指定するだけでLazy Loadingが実現できます。

```html
<img src='example.webp' loading='lazy' alt='example' />
```

簡単ですね！

## Hugoでの画像の挿入方法

HugoではMarkdownで記事を書くので、画像を入れるにはMarkdownで記述します。

```markdown
![./example.webp](example)
```

これをHugoが`img`タグに変換してくれるのですが、当然デフォルトでLazy Loading属性はつけてくれません。

## Markdown Render Hooksを使う

HugoにはMarkdownからHTMLへの変換をカスタマイズできるMarkdown Render Hooksという機能があります。（v0.62.0以上、MarkdownレンダラにGoldmarkを使用する場合のみ）

`layout/_default/_markup`フォルダに`render-image.html`という名前でテンプレートファイルを作成すると、このテンプレートを使い`img`タグへ変換してくれます。

以下3種類が利用可能です。それぞれ先頭に`render-`を付け、拡張子は`.html`のファイル名になります。

* image
* link
* heading (v0.71.0)

## render-image.htmlのサンプル

`render-image.html`の内容を下記とすることでLazy Loading属性を付けることができます。

```html
<!-- layouts/_default/_markup/render-image.html -->
<img src="{{ .Destination | safeURL }}" alt="{{ .Text }}" loading="lazy" />
```

## まとめ

Markdown Render Hooksを使うことで簡単に`img`タグをカスタマイズしてLazy Loading属性を付けることができました！

Shortcodeを使う方法もありますが、Markdown Render Hooksを使えば記事をMarkdownで書く際には何も気にしなくてよいのでこちらのほうが便利です。

Lazy Loadingの他に、`width`, `height`属性も追加しましたが、少し工夫が必要でしたので別の記事で紹介したいと思います。
