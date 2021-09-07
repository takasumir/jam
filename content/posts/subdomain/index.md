---
title: "NetlifyのサイトをGoogle Domainsのサブドメインを使って運用する"
date: 2021-09-06T12:33:04+09:00
draft: false
keywords: "Hugo, Netlify, Jamstack, ブログ, Googleドメイン, サブドメイン"
tags: ["Hugo", "Netlify", "Jamstack", "ブログ, Googleドメイン, サブドメイン"]
---

Netlifyは簡単に静的サイトを構築できる便利なサービスです。流行りのJamstackでブログを運用できたらと思いこのサイトを作りました。

一通りHugo, Githubの設定をして記事を書けるようになりましたが、ドメインが "jamblog.netlify.app" です。これはこれでシンプルなので悪くないと思っていましたがやはり独自ドメインで運用したいもの。

Netlifyでドメインを取得すれば何も考えなくても独自ドメインで運用できます。しかしながら既にGoogleのブログサービス、Bloggerで別のブログをやっていて独自ドメインもGoogle Domains取得しています。独自ドメインはお金がかかるので、できれば今持っているドメインで運用したいと考えました。

そこで、今のBloggerでのブログは活かしたまま、サブドメインを作り、Netlifyで運用しているこのブログに割り当てましたのでやり方をご紹介します。

## Google Domainsでサブドメインを作る

既にGoogle Domainsで独自ドメインを持っていることを前提とします。まずはGoogle Domainsにログインします。

![GoogleDomains](./GoogleDomains1.png)

「ウェブサイト」にはBloggerのサイトがあります。もともとBloggerから独自ドメインを申し込んだ経緯からです。

![GoogleDomainsウェブサイト画面](./GoogleDomains2.png)

「DNS」のリソースレコードにカスタムレコードという項目があります。下の画像では既に1項目設定されていますが、初期設定では何も無い状態になります。その他メール転送、ブログホスティングの項目は、Bloggerで設定されたものが表示されていますが今回は関係ありません。

![DNSカスタムレコード](./GoogleDomains3.png)

デフォルトのネームサーバーの、カスタムレコードの「新しいレコードを作成」をクリックしてホスト名に好きなサブドメイン名を、タイプに「CNAME」を、TTLは始めから3600が入っているのでそのままにし、データにNetlifyでのサイトの（サブドメイン含む）ドメイン名を入れて保存します。

保存後、Netlifyのドメイン名の最後にピリオド「.」が着きますが、気にしなくて良いです。(jamblog.netlify.app**.** になっています）

これでGoogle Domainsの設定は終わりです。

## Netlifyにサブドメインを設定

次に、Netlify側の設定をしましょう。NetlifyにログインしてサイトのDomain settingsをクリックします。

Custom domainsの項目にAdd custom domainボタンがあるのでクリックします。

さきほどGoogle Domainsで作ったサブドメインを含むドメイン名を入れてVerifyをクリックします。この例ではjam.bchari.comです。

既にドメイン名が登録されているよ、と警告が出ます。もちろんGoogle Domainsで登録しているからなのでこのままAdd domainをクリックして進めます。

SSL/TSL certificateのVerify DNS configurationをクリック。

DNS verification was scccessfulと出ました。

Custom domainsにも登録したjam.bchari.comがPrimary domainとして登録されています。

## Hugoのconfig.tomlの設定

Hugoのサイト設定ファイル、config.tomlのbaseURLの設定を変更します。変更前は、下記のようにnetlifyのドメインになっています。

```
baseURL = "https://jamblog.netlify.app/"
```

これを先程作ったjam.bchari.comに書き換えます。

```
baseURL = "https://jam.bchari.com/"
```

## ビルドして確認

