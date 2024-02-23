const amazonPaapi = require("amazon-paapi");

const commonParameters = {
    AccessKey: "AKIAIZ3UGYYMRIOE6H3A",
    SecretKey: "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",
    PartnerTag: "takasumir-22",
    PartnerType: "Associates",
    Marketplace: "www.amazon.co.jp",
};
const requestParameters = {
    ItemIds: ["B09MCRYG2Y"],
    ItemIdType: "ASIN",
    Condition: "New",
    Resources: [
        "Images.Primary.Medium",
        "ItemInfo.Title",
        "Offers.Listings.Price",
        //        "CustomerReviews.Count",
        //        "CustomerReviews.StarRating",
    ],
};
const allowed_origins = [
    "https://jam.bchari.com",
    "https://jamblog.netlify.app",
];
// 関数本体 リクエストのパラメーター asin をアマゾンPA-APIに問い合わせ、
// PA-APIからのレスポンスにAccess-Control-Allow-Originヘッダーを付ける
export default async (req, context) => {
    const origin = req.headers.get("Origin");
    console.log(context.params);
    console.log(origin);
    const asins = context.params.asin.split("/");

    requestParameters.ItemIds = asins;
    let res = "";

    /** Promise */
    await amazonPaapi
        .GetItems(commonParameters, requestParameters)
        .then((data) => {
            res = JSON.stringify(data);
        })
        .catch((error) => {
            console.log(error);
            res = null;
        });

    let header;
    if (allowed_origins.includes(origin)) {
        header = {
            "Access-Control-Allow-Origin": origin,
            "Netlify-CDN-Cache-Control": "public, s-maxage=86400, immutable",
            "Cache-Control": "public, max-age=86400, immutable",
            "Netlify-Vary": "query",
        };
    }
    return new Response(res, {
        status: 200,
        statusText: "Netlify functions ppapi returned",
        headers: header,
    });
};
// URLを https://ドメイン名/paapi/「asin」とし、asinをパラメーターとして
// 関数本体へ渡す
export const config = {
    path: "/paapi-js/:asin+",
};
