---
title: "Hugo+NetlifyでJamstackブログの作り方 (1)事前準備"
date: 2021-05-04T20:09:18+09:00
draft: false
---

![Jamstack logo](/image/Jamstack_Logo_Original.svg)

今までGoogleのサービス、Bloggerでブログを書いていましたがカスタマイズに制約を感じ、レスポンスも遅くGoogleのUX指標Core Web Vitalはかなり低い状態でした。Blogger自体もここ数年ほとんど更新されていなくてBloggerのテンプレート書式を覚えてガリガリカスタマイズするのも何だかなあと思っていました。

そこで最近流行りそうなJamstackでブログを作ってみようと思い、まずはJamstackでブログを作るまでのやり方を記事にしてみます。

静的サイトジェネレーターとしてHugoを使い、Gitに記事をアップロードしてNetlifyでホスティングします。

## Hugoのインストール

![Hugo logo](/image/Logo_of_Hugo_the_static_website_generator.svg)

Hugoの公式サイトから入手。
[https://gohugo.io/getting-started/installing/](https://gohugo.io/getting-started/installing/)

Windows用のバイナリをダウンロードできますが、パッケージマネージャ
Chocolateryを使ってインストールしてみました。

管理者モードのPowershellで下記コマンドを実行します。

```powershell
> choco install hugo -confirm
```

Chocolateryは[https://community.chocolatey.org/](https://community.chocolatey.org/ "Chocolatery")を参照ください。

## GitHub Desktopのインストール

[https://desktop.github.com/](https://desktop.github.com/ "Github
Desktop")インストールしてみたものの、後述するHugoテーマのダウンロード
でsubmoule の追加方法が分からず、結局GitHub Desktopは使わず次のGitをイ
ンストールしました。

## Gitのインストール

Github Desktopでうまくいかず、こちらを入手しインストールしました。
[https://git-scm.com/downloads](https://git-scm.com/downloads "Git")


# Webサイトを作ってみる

[https://gohugo.io/getting-started/quick-start/](https://gohugo.io/getting-started/quick-start/)
を参考にやってみました。以下、ほぼこのQuick startガイドの手順通りです。

適当なフォルダを作り、Powershellで下記コマンドを実行します。（注：サイト名quickstartは適当に名前変えてください）

```powershell
> hugo new site quickstart
```

カレントディレクトリ下に quickstart フォルダが作成され、その下にこんなかんじでフォルダツリーが作成されます。

![フォルダツリー](/image/foldertree.webp)

あと3ステップやることがあるとのメッセージが出てきました。

1. テーマのダウンロードと追加
1. コンテンツを追加
1. ウェブサーバー起動

## テーマのダウンロードと追加

WindowsスタートメニューからGit Bashを起動。先程作成したquickstartフォ
ルダに移動。Git BashじゃなくてPowershellからでもOKと思います。

最後の1行は、テーマのインストールで ananke というテーマを取ってきています。

```sh
$ cd quickstart
$ git init
$ git submodule add https://github.com/theNewDynamic/gohugo-theme-ananke.git themes/ananke
```

Git Bashで下記コマンドを実行してconfig.tomlに ananke テーマを登録します。

```sh
$ echo theme = \"ananke\" >> config.toml
```

単に「theme = "anake"」という行をメモ帳などでconfig.tomlに追加してもい
いです。

## コンテンツの追加

PowershellかGit Bashで下記コマンドを実行。

```sh
$ hugo new posts/my-first-post.md
```

postsというフォルダと、その中にmy-first-post.mdというファイルができま
す。

my-first-post.mdを編集してみます。

```
---
title: "初めての投稿"
date: 2021-04-04T12:46:20+09:00
draft: true
summary: "ブログ初心者が最近流行りのJamstackでブログを作ります！初めてのテスト投稿です。"
---

ブログ初心者が最近流行りのJamstackでブログを作ります！Hugo, Git, Netlifyの登録、設定、使い方などについて書いていきます。
```

`draft: true`は、この投稿がドラフト状態ということで、`hugo`コマンドに`-D`オプションを付けるとドラフト記事が表示されます。


## ローカルサーバの起動

```sh
$ hugo server -D
```

Google Chromeで http://localhost:1313/ にアクセスすると、記事が表示さ
れました！

## config.tomlの編集

languageCode を "en-US" から "ja-JP" に変更。

title を "Hugoで作るウェブサイト" に書き換え。

baseURL は、アップロードする自分のサイトのURLですがとりあえずローカル
で試す分には必要ないので "http://example.org/" のままにしています。

## ページの生成

```sh
hugo -D

Error: Error copying static files: open C:\Users\****\Documents\Hugo\quickstart\public\images\gohugo-default-sample-hero-image.jpg: Access is denied.
```

あれれ、エラーが出てしまいました。imagesフォルダは空で
gohugo-sample-hero-image.jpgなんてありません。

`C:\Users\****\Documents\Hugo\quickstart\themes\ananke\static\images`に
同名のJPGファイルがあったのでとりあえず`\public\images`にコピーしてみま
す。

もう一度 hugo -D するとうまくいきました。

http://localhost:1313/ をまた表示します。先程作った記事へのリンクが表
示されていますね。クリックしてみます。

記事も表示されました。が、さきほどのJPGファイルはどこにも出てきません。

config.tomlに[params]セクションを追加しfeatured_imageを指定することで
画像も表示されるようになりました。なんか怖い画像ですね。

![hugo first blog screenshot](/image/hugo_first_blog_screenshot.webp)

## まとめ

Jamstackでブログを作る場合Hugo、Gitとインストール、設定が必要でした。次は作ったページをアップロードしていきます。このあとGitに記事をアップロードしてでNetlifyでホスティングをするためにまだやることがあります。次の記事で説明したいと思います。

Bloggerなどの既存ブログサービスは登録すれば何も考えずにとりあえず記事を作成できますが、Jamstackではそれなりの準備が必要でした。

一度設定さえできてしまえば静的サイトの恩恵（速さ）にあずかれるはずなので記事を書きながら学んでいきたいと思います。
