(() => {
  // <stdin>
  async function getItems(asins) {
    const params = asins.join("/");
    try {
      const response = await fetch(
        `https://jam.bchari.com/paapi-js/${params}`,
        {
          mode: "cors"
        }
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
        (elem) => elem.ASIN === ad.dataset.asin
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
      ad.querySelector(".paapi5-pa-product-list-price-value").innerText = item.Offers?.Listings[0].Price.DisplayAmount ?? "";
    });
  }
  document.addEventListener("DOMContentLoaded", renderItems);
})();
