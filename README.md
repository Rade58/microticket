# STRIPE SETUP

***

digrsija: (ALI VAZNA)

TI SI SE VEC JEDNOM BAVIO SA STRIPE-OM:

1) [________](https://github.com/Rade58/gatsby-shopify-theme-workspace/tree/5_SETTING_UP_STRIPE#setting-up-stripe-a-n-connecting-stripe-to-gatsby)

2) [________](https://github.com/Rade58/gatsby-shopify-theme-workspace/tree/5_1_STRIPE_MULTIPLE_PRODUCTS_MULTIPLE_PRICES#dakle-u-proslom-branchu-sam-podesio-stripe-i-uspesno-implementirao-checkout-a-sada-cu-sagledati-jos-nekoliko-stvari-koje-su-easy-sa-stripe-om)

3) [________](https://github.com/Rade58/gatsby-shopify-theme-workspace/tree/5_2_FETCHING_STRIPE_DATA#fetching-stripe-data)

***

IMAMO SOME CODE IN PLACE INSIDE CREATE CHARGE HANDLERA, ALI NISMO NISTA DEFINISALI U POGLEDU STRIPE-A

**MI MORAMO DEFINISATI CODE ZA ACCEPTING PAYMENTA, KOJI USER ZELI DA PROVIDE-UJE ZA ORDER**

U HANDLERU NAM JEDOSTUPAN `TOKEN FROM STRIPE`

**SA TIM TOKENOM, MI RECH-UJEMO OUT TO STRIPE API, I ACTUALLY CHARGE USERS CREDIT CARD**
