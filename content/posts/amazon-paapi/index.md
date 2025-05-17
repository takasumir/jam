---
title: "HugoでAmazonアソシエイトのリンクを作成する"
date: 2024-02-23T22:09:46+09:00
draft: false
js: paapi.js
keywords: "Hugo, Amazonアソシエイト, PA-API, アフェリエイト"
tags: ["Hugo", "Amazonアソシエイト", "PA-API", "アフェリエイト"]
---

Hugoで作ったサイトにAmazonアソシエイトの広告を設置する方法をまとめました。

## 前提条件

このブログはNetlifyにデプロイしているのでその前提で以下解説します。Netlify functionsはいわゆるFaaSというもので、他のサイトから呼び出してもかまわないのでそのあたりは応用が効くと思います。

## Netlify functionsでWeb APIを作る

以前に[BloggerからNetlify functionsを呼び出す](https://www.bchari.com/2024/01/pa-api-3.html)やりかたを書きました。基本的に全く同じで、Hugoの場合もサイトのディレクトリ直下に`netlify/functions`フォルダを作成して、そこに[Javascriptファイル](https://github.com/takasumir/jam/blob/main/netlify/functions/amazonpaapi-js.js)を置きます。

Node.jsのamazon-paapiモジュールを使うので、Hugoサイト直下で`npm install amazon-paapi`しましょう。

## Shortcodeで広告の雛形を作る

上で紹介した[BloggerからNetlify functionsを呼び出す](https://www.bchari.com/2024/01/pa-api-3.html)記事では、htmlのtemplateを作り、クローンノードを作成しました。

Hugoの場合はやはり雛形を作るのですが、Shortcodeにするのがよいと思います。`layouts/shortcodes/amazon.html`に雛形を作ります。

```html
<div class="paapi5-pa-ad-unit" data-asin="{{.Get 0}}">
  <div class="paapi5-pa-product-container">
    <div class="paapi5-pa-product-image">
      <div class="paapi5-pa-product-image-wrapper">
        <a class="paapi5-pa-product-image-link" href="" title="" target="_blank"
          ><img
            class="paapi5-pa-product-image-source"
            src=""
            alt=""
            width=""
            height=""
        /></a>
      </div>
    </div>
    <div class="paapi5-pa-product-details">
      <div class="paapi5-pa-product-title">
        <a
          class="paap5-pa-product-title-link"
          href=""
          title=""
          target="_blank"
        ></a>
      </div>
      <div class="paapi5-pa-product-list-price">
        <span class="paapi5-pa-product-list-price-value"></span>
      </div>
      <div class="paapi5-pa-product-prime-icon">
        <span class="icon-prime-all"></span
        ><a class="paap5-pa-product-title-link" href="" title="" target="_blank"
          ><span class="buy-on-amazon">Amazonで買う</span></a
        >
      </div>
    </div>
  </div>
</div>
```

雛形は好きなように作ってもらえばよいですが、Amazon Scratchpadで吐き出されるHTMLを流用しました。ポイントは1行目でGo Templateを使っていることろです。

```html
data-asin="{{.Get 0}}"
```

これで、記事のMarkdownファイル内で下記のように記載するだけでASIN情報を付与した雛形を挿入することができます。

```go
{{</* amazon "B08KYMYHCX" */>}}
```

## クライアントサイドのJavascriptでAPIから情報を取得する

クライアントサイドのJavascriptで先程のShortcodeで作ったテンプレートからASINを取得し、API(Netlify functions)にfetchして、返ってきたJSONデータを雛形に流し込むことになります。

このJavascirptも[BloggerからNetlify functionsを呼び出す](https://www.bchari.com/2024/01/pa-api-3.html)と全く同じでよいです。

Javascriptも、雛形同様にShortcodeで読み込んでもよいと思いますし、Partialにしてもよいかと思いますが、今回は記事のMarkdownファイルのFront matterの中で、Javascriptを読み込むようにしてみました。

`assets/paapi.js`のファイル名で下記Javascriptを置いておきます。

```javascript
async function getItems(asins) {
    const params = asins.join("/");
    try {
        const response = await fetch(
            `https://jam.bchari.com/paapi-js/${params}`,
            {
                mode: "cors",
            },
        );
        if (!response.ok) {
            throw new Error("Network response was not OK");
        }
        const items = await response.json();
        return items;
    } catch (err) {
        console.log(err, "Fetch error");
        return null;
    }
}
async function renderItems() {
    const ads = document.querySelectorAll(".paapi5-pa-ad-unit");
    const asins = [];
    ads.forEach((elem) => {
        const asin = elem.dataset.asin;
        asins.push(asin);
    });
    const res = await getItems(asins);
    ads.forEach((ad) => {
        const link = ad.querySelectorAll(".paap5-pa-product-title-link");
        const item = res.ItemsResult.Items.find(
            (elem) => elem.ASIN === ad.dataset.asin,
        );
        link.forEach((elem) => {
            elem.href = item.DetailPageURL;
            elem.title = item.ItemInfo.Title.DisplayValue;
            if (elem.innerText === "") {
                elem.innerText = item.ItemInfo.Title.DisplayValue;
            }
        });
        const img_a = ad.querySelector(".paapi5-pa-product-image-link");
        const img = img_a.firstChild;
        img_a.href = item.DetailPageURL;
        img_a.title = item.ItemInfo.Title.DisplayValue;
        img.src = item.Images.Primary.Medium.URL;
        img.alt = item.ItemInfo.Title.DisplayValue;
        img.width = item.Images.Primary.Medium.Width;
        img.height = item.Images.Primary.Medium.Height;
        ad.querySelector(".paapi5-pa-product-list-price-value").innerText =
            item.Offers?.Listings[0].Price.DisplayAmount ?? "";
    });
}
document.addEventListener("DOMContentLoaded", renderItems);
```

Front matterで下記のように`js: paapi.js`でJavascriptを読み込みます。

```yaml
---
title: "Hugo本を読んでみた"
date: 2024-02-23T16:03:56+09:00
js: paapi.js
---
```

Hugoのテーマのおおもととなる`baseof.html`の変更が必要です。テーマの`baseof.html`を上書きするため、`themes/ananke/layouts/_default/baseof.html`をサイト直下の`layouts/_default/baseof.html`にコピーします。

このブログはテーマとしてanankeを使っていますが、別のテーマでも同様です。

headタグの中に書きを追記します。Front matterに`js`という項目があれば、`js:`のあとに続くファイル名のJavascriptを読み込むという仕掛けです。

```html
{{ if .Params.js }}
  {{ $js := resources.Get .Params.js | js.Build }}
  <script type="text/javascript" src="{{ $js.RelPermalink }}" defer></script>
{{ end }}

```

`baseof.html`の全体は[Githubのレポジトリ](https://github.com/takasumir/jam/blob/main/layouts/_default/baseof.html)を参照ください。

これでこんなリンクを作ることができました。

{{< amazon "1680507265" >}}

## まとめ

Hugoは静的サイトジェネレーターですが、JavascriptとAPIを使うことでクライアントサイドで動的にAmazonの商品情報を取得し、Amazonアソシエイトのリンクを作ることができました。

今回は動的にリンクを作る例を解説しましたが、デプロイ時に静的にリンクを作っておくこともできます。上でご紹介した本にはAmazonアソシエイトそのものの例はありませんが、静的にレンダリングするやり方についても記載があるので興味があれば読んでみることをおすすめします。
