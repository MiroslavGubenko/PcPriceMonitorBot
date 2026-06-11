npm i
npm run start

## config/components.json 

```
{
    "name": "FOR THE NAME (this is id for history.json)",
    "urls": [ url, url, etc...]
    ]
  }
``` 
```
url = {
    link: "www.shop.link_to_item/",
    tag?: "optional tag for item"
}
```

## config/settings.json
```
{
    "currencySymbol": "грн, $, EUR etc. label for price",
    "telegram": {
        "reportTitle": "Report title ex: '📈 Daily prices report'"
    },
    "priceSelectors": {
        "site1.com": "div.tovar-price span[itemprop=\"price\"]", // selectors for scrapping
        "site2.com": "div.card-block__price-summ",
        "site3.com": "p.product-price__big"
    }
}
```
