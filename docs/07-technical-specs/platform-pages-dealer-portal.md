# Dealer Portal - Page Specifications
## portal.demagroup.be

---

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    DEALER PORTAL PAGE SPECIFICATIONS                         ║
║                    B2B E-commerce Platform                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 1. Site Map

```
portal.demagroup.be/
│
├── /login ───────────────────────────────── Login Page
├── /wachtwoord-vergeten ─────────────────── Password Reset
├── /registreren ─────────────────────────── Registration (redirect to public)
│
├── / ────────────────────────────────────── Dashboard (Home)
│
├── /producten ───────────────────────────── Product Catalog
│   ├── /categorie/[slug] ────────────────── Category View
│   ├── /merk/[brand] ────────────────────── Brand View
│   ├── /product/[sku] ───────────────────── Product Detail
│   ├── /zoeken ──────────────────────────── Search Results
│   └── /nieuw ───────────────────────────── New Products
│
├── /winkelwagen ─────────────────────────── Shopping Cart
│   └── /afrekenen ───────────────────────── Checkout
│
├── /bestellingen ────────────────────────── Orders
│   ├── /[orderId] ───────────────────────── Order Detail
│   ├── /tracking/[orderId] ──────────────── Order Tracking
│   └── /herbestellen/[orderId] ──────────── Reorder
│
├── /lijsten ─────────────────────────────── Shopping Lists
│   ├── /favorieten ──────────────────────── Favorites
│   ├── /[listId] ────────────────────────── List Detail
│   └── /nieuw ───────────────────────────── Create List
│
├── /offertes ────────────────────────────── Quotes
│   ├── /aanvragen ───────────────────────── Request Quote
│   ├── /[quoteId] ───────────────────────── Quote Detail
│   └── /historie ────────────────────────── Quote History
│
├── /account ─────────────────────────────── Account
│   ├── /profiel ─────────────────────────── Company Profile
│   ├── /gebruikers ──────────────────────── Users
│   ├── /adressen ────────────────────────── Addresses
│   ├── /facturen ────────────────────────── Invoices
│   ├── /betalingen ──────────────────────── Payments
│   └── /instellingen ────────────────────── Settings
│
├── /support ─────────────────────────────── Support
│   ├── /tickets ─────────────────────────── Support Tickets
│   ├── /nieuw-ticket ────────────────────── Create Ticket
│   ├── /faq ─────────────────────────────── FAQ
│   └── /chat ────────────────────────────── AI Chat Assistant
│
├── /downloads ───────────────────────────── Downloads
│   ├── /catalogi ────────────────────────── Catalogs
│   ├── /prijslijsten ────────────────────── Price Lists
│   └── /technische-docs ─────────────────── Technical Docs
│
└── /meldingen ───────────────────────────── Notifications
```

---

## 2. Page Specifications

### 2.1 Login Page (/login)

#### Purpose
Authenticate dealers to access the portal.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                          ┌─────────────────────────┐                        │
│                          │                         │                        │
│                          │      [DEMA LOGO]        │                        │
│                          │                         │                        │
│                          │   Dealer Portal Login   │                        │
│                          │                         │                        │
│                          │   ┌─────────────────┐   │                        │
│                          │   │ E-mail          │   │                        │
│                          │   └─────────────────┘   │                        │
│                          │                         │                        │
│                          │   ┌─────────────────┐   │                        │
│                          │   │ Wachtwoord      │   │                        │
│                          │   └─────────────────┘   │                        │
│                          │                         │                        │
│                          │   ☐ Onthoud mij         │                        │
│                          │                         │                        │
│                          │   [    Inloggen    ]    │                        │
│                          │                         │                        │
│                          │   Wachtwoord vergeten?  │                        │
│                          │                         │                        │
│                          │   ─────────────────     │                        │
│                          │                         │                        │
│                          │   Nog geen account?     │                        │
│                          │   Word dealer →         │                        │
│                          │                         │                        │
│                          └─────────────────────────┘                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Features
- Email/password authentication
- Remember me option
- Password reset link
- Link to dealer application
- Error messages for invalid credentials
- Rate limiting for security

---

### 2.2 Dashboard (/)

#### Purpose
Central hub for dealers to access key functions and see important information.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ [Logo]  [Search.................................] [🛒 3] [👤▼] [🔔]  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│  NAVIGATION                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Dashboard │ Producten │ Bestellingen │ Lijsten │ Offertes │ Account │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  WELCOME BANNER                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Welkom terug, [Naam]! 👋                                           │   │
│  │  Loonwerk Janssens BV | Silver Dealer | 20% korting                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌───────────────────────────────┐  ┌───────────────────────────────────┐  │
│  │  QUICK ORDER                  │  │  ACCOUNT SUMMARY                  │  │
│  │                               │  │                                   │  │
│  │  SKU: [              ] [+]    │  │  Openstaand:     €2,450.00       │  │
│  │                               │  │  Kredietlimiet:  €10,000.00      │  │
│  │  Recent gezocht:              │  │  Beschikbaar:    €7,550.00       │  │
│  │  • DAB-NOVA300MA              │  │                                   │  │
│  │  • ABSBU025                   │  │  Tier: 🥈 Silver (€25K+/jaar)    │  │
│  │  • PMP-CENT-750               │  │  [Upgrade naar Gold →]           │  │
│  │                               │  │                                   │  │
│  │  [Bulk bestelling uploaden]   │  │  Volgende factuur: 15 jan       │  │
│  └───────────────────────────────┘  └───────────────────────────────────┘  │
│                                                                              │
│  RECENTE BESTELLINGEN                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Order #      │  Datum    │  Bedrag     │  Status        │  Actie   │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │  #2024-1234   │  15 Dec   │  €1,234.56  │  🚚 Onderweg   │  [→]     │   │
│  │  #2024-1233   │  12 Dec   │  €567.89    │  ✅ Geleverd   │  [↻]     │   │
│  │  #2024-1232   │  10 Dec   │  €2,345.00  │  ✅ Geleverd   │  [↻]     │   │
│  │  #2024-1231   │  08 Dec   │  €890.00    │  ✅ Geleverd   │  [↻]     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  [Alle bestellingen bekijken →]                                            │
│                                                                              │
│  ┌───────────────────────────────┐  ┌───────────────────────────────────┐  │
│  │  FAVORIETEN                   │  │  MELDINGEN                        │  │
│  │                               │  │                                   │  │
│  │  [img] Dompelpomp 400W  [+]  │  │  🔔 Nieuwe prijslijst 2025       │  │
│  │  [img] PE-buis 32mm     [+]  │  │  📦 Order #1234 verzonden        │  │
│  │  [img] Makita accu 18V  [+]  │  │  📄 Factuur #5678 beschikbaar    │  │
│  │  [img] Slangkoppeling   [+]  │  │  ⭐ Nieuw: DAB E.sybox Mini 3    │  │
│  │                               │  │                                   │  │
│  │  [Alle favorieten →]          │  │  [Alle meldingen →]              │  │
│  └───────────────────────────────┘  └───────────────────────────────────┘  │
│                                                                              │
│  AANBEVOLEN VOOR U                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ [Image]  │ │ [Image]  │ │ [Image]  │ │ [Image]  │ │ [Image]  │        │
│  │ Product1 │ │ Product2 │ │ Product3 │ │ Product4 │ │ Product5 │        │
│  │ €123.45  │ │ €234.56  │ │ €345.67  │ │ €456.78  │ │ €567.89  │        │
│  │ [+ Cart] │ │ [+ Cart] │ │ [+ Cart] │ │ [+ Cart] │ │ [+ Cart] │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Widgets

| Widget | Content | Actions |
|--------|---------|---------|
| **Quick Order** | SKU input, recent searches | Add to cart |
| **Account Summary** | Balance, credit, tier | View details |
| **Recent Orders** | Last 5 orders | View, reorder |
| **Favorites** | Top 4 favorites | Add to cart |
| **Notifications** | Latest 4 notifications | View all |
| **Recommendations** | AI-powered suggestions | Add to cart |

---

### 2.3 Product Catalog (/producten)

#### Purpose
Browse and search the complete product catalog.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER + NAVIGATION (same as dashboard)                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  BREADCRUMB: Dashboard > Producten                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  SEARCH BAR                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 🔍 [Zoek op SKU, productnaam of trefwoord...                    ] │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CATEGORY GRID                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │    [Icon]    │ │    [Icon]    │ │    [Icon]    │ │    [Icon]    │      │
│  │    Pompen    │ │   Irrigatie  │ │   Slangen    │ │   Fittingen  │      │
│  │  1,057 prod. │ │   523 prod.  │ │  1,342 prod. │ │   892 prod.  │      │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │    [Icon]    │ │    [Icon]    │ │    [Icon]    │ │    [Icon]    │      │
│  │   Kleppen    │ │    Buizen    │ │  Gereedschap │ │   Perslucht  │      │
│  │   456 prod.  │ │   892 prod.  │ │  2,424 prod. │ │  2,050 prod. │      │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘      │
│                                                                              │
│  POPULAR BRANDS                                                             │
│  [Makita] [Kränzle] [Airpress] [DAB] [Wilo] [Grundfos] [Alle merken →]    │
│                                                                              │
│  NEW PRODUCTS                                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ [Image]  │ │ [Image]  │ │ [Image]  │ │ [Image]  │ │ [Image]  │        │
│  │ NEW      │ │ NEW      │ │ NEW      │ │ NEW      │ │ NEW      │        │
│  │ Product  │ │ Product  │ │ Product  │ │ Product  │ │ Product  │        │
│  │ €xxx.xx  │ │ €xxx.xx  │ │ €xxx.xx  │ │ €xxx.xx  │ │ €xxx.xx  │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│  [Alle nieuwe producten →]                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 2.4 Category Page (/producten/categorie/[slug])

#### Purpose
Browse products within a specific category with filtering.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BREADCRUMB: Dashboard > Producten > Pompen > Dompelpompen                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  CATEGORY HEADER                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  H1: Dompelpompen                                                    │   │
│  │  234 producten gevonden                                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────┐  ┌──────────────────────────────────────────────┐  │
│  │  FILTERS           │  │  TOOLBAR                                     │  │
│  │                    │  │  Sorteren: [Relevantie ▼]  [Grid] [List]    │  │
│  │  Subcategorie      │  ├──────────────────────────────────────────────┤  │
│  │  ☑ Vuil water     │  │                                              │  │
│  │  ☐ Schoon water   │  │  PRODUCT GRID                                │  │
│  │  ☐ Drainage       │  │                                              │  │
│  │                    │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │  │
│  │  Merk              │  │  │ [Image]  │ │ [Image]  │ │ [Image]  │    │  │
│  │  ☑ DAB            │  │  │ SKU123   │ │ SKU124   │ │ SKU125   │    │  │
│  │  ☐ Wilo           │  │  │ DAB Nova │ │ Wilo TMW │ │ Grundfos │    │  │
│  │  ☐ Grundfos       │  │  │ 300 M-A  │ │ 32/8     │ │ Unilift  │    │  │
│  │  ☐ Tsurumi        │  │  │          │ │          │ │          │    │  │
│  │                    │  │  │ €234.56  │ │ €345.67  │ │ €456.78  │    │  │
│  │  Vermogen          │  │  │ ✅ 23 vrd│ │ ⏳ 2-3 dg│ │ ✅ 12 vrd│    │  │
│  │  ☐ 250W           │  │  │          │ │          │ │          │    │  │
│  │  ☑ 400W           │  │  │ [♡] [+🛒]│ │ [♡] [+🛒]│ │ [♡] [+🛒]│    │  │
│  │  ☐ 750W           │  │  └──────────┘ └──────────┘ └──────────┘    │  │
│  │  ☐ 1000W+         │  │                                              │  │
│  │                    │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │  │
│  │  Opvoerhoogte      │  │  │ ...      │ │ ...      │ │ ...      │    │  │
│  │  ☐ 0-5m           │  │  └──────────┘ └──────────┘ └──────────┘    │  │
│  │  ☑ 5-10m          │  │                                              │  │
│  │  ☐ 10-20m         │  │  PAGINATION                                  │  │
│  │  ☐ 20m+           │  │  [1] [2] [3] ... [12] [Volgende →]          │  │
│  │                    │  │                                              │  │
│  │  Prijs             │  │                                              │  │
│  │  €0 ────●──── €500│  │                                              │  │
│  │                    │  │                                              │  │
│  │  Voorraad          │  │                                              │  │
│  │  ☑ Op voorraad    │  │                                              │  │
│  │  ☐ Alle           │  │                                              │  │
│  │                    │  │                                              │  │
│  │  [Filters wissen]  │  │                                              │  │
│  └────────────────────┘  └──────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Filter Options

| Filter | Type | Options |
|--------|------|---------|
| **Subcategory** | Checkbox | Dynamic based on category |
| **Brand** | Checkbox | All brands in category |
| **Price** | Range slider | Min-max |
| **Stock** | Toggle | In stock only |
| **Specs** | Dynamic | Based on category (power, size, etc.) |

#### Sort Options

| Option | Description |
|--------|-------------|
| **Relevantie** | Default, based on popularity |
| **Prijs laag-hoog** | Ascending price |
| **Prijs hoog-laag** | Descending price |
| **Nieuwste** | Most recently added |
| **Naam A-Z** | Alphabetical |
| **Voorraad** | In stock first |

---

### 2.5 Product Detail Page (/producten/product/[sku])

#### Purpose
Display complete product information and enable ordering.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BREADCRUMB: Dashboard > Producten > Pompen > Dompelpompen > DAB Nova 300   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────┐  ┌──────────────────────────────────┐  │
│  │                                │  │  DAB Nova 300 M-A                │  │
│  │                                │  │  Dompelpomp voor schoon water    │  │
│  │                                │  │                                  │  │
│  │        [MAIN PRODUCT IMAGE]    │  │  SKU: DAB-NOVA300MA              │  │
│  │                                │  │  Merk: DAB Pumps                 │  │
│  │                                │  │  EAN: 8010693012345              │  │
│  │                                │  │                                  │  │
│  │  [thumb] [thumb] [thumb] [vid] │  │  ┌────────────────────────────┐ │  │
│  │                                │  │  │  UW PRIJS                  │ │  │
│  └────────────────────────────────┘  │  │                            │ │  │
│                                       │  │  €234.56 excl. BTW        │ │  │
│                                       │  │  €283.82 incl. BTW        │ │  │
│                                       │  │                            │ │  │
│                                       │  │  Adviesprijs: €293.20     │ │  │
│                                       │  │  Uw korting: 20% (Silver) │ │  │
│                                       │  └────────────────────────────┘ │  │
│                                       │                                  │  │
│                                       │  VOORRAAD                        │  │
│                                       │  ✅ 23 op voorraad               │  │
│                                       │  📦 Morgen in huis (bestel <18u) │  │
│                                       │                                  │  │
│                                       │  AANTAL                          │  │
│                                       │  [-] [  1  ] [+]                 │  │
│                                       │                                  │  │
│                                       │  [🛒 TOEVOEGEN AAN WINKELWAGEN]  │  │
│                                       │                                  │  │
│                                       │  [♡ Favoriet] [📋 Aan lijst]    │  │
│                                       │  [📄 Offerte aanvragen]          │  │
│                                       │                                  │  │
│                                       └──────────────────────────────────┘  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [Specificaties] [Documenten] [Gerelateerd] [Accessoires]           │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  TECHNISCHE SPECIFICATIES                                           │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  Algemeen                                                    │   │   │
│  │  ├─────────────────────────────────────────────────────────────┤   │   │
│  │  │  Vermogen              │  300W                              │   │   │
│  │  │  Spanning              │  230V / 50Hz                       │   │   │
│  │  │  Beschermingsklasse    │  IP68                              │   │   │
│  │  │  Materiaal behuizing   │  Technopolymeer                    │   │   │
│  │  ├─────────────────────────────────────────────────────────────┤   │   │
│  │  │  Prestaties                                                  │   │   │
│  │  ├─────────────────────────────────────────────────────────────┤   │   │
│  │  │  Max. opvoerhoogte     │  6m                                │   │   │
│  │  │  Max. debiet           │  8.000 l/h                         │   │   │
│  │  │  Max. korrelgrootte    │  10mm                              │   │   │
│  │  │  Max. vloeistoftemp.   │  35°C                              │   │   │
│  │  ├─────────────────────────────────────────────────────────────┤   │   │
│  │  │  Afmetingen                                                  │   │   │
│  │  ├─────────────────────────────────────────────────────────────┤   │   │
│  │  │  Aansluiting           │  1" binnendraad                    │   │   │
│  │  │  Kabellengte           │  10m                               │   │   │
│  │  │  Gewicht               │  4.2 kg                            │   │   │
│  │  │  Afmetingen (LxBxH)    │  158 x 158 x 270 mm               │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  DOCUMENTEN                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📄 Technische fiche (PDF, 245 KB)              [Download]          │   │
│  │  📄 Installatiehandleiding (PDF, 1.2 MB)        [Download]          │   │
│  │  📄 Pompkromme (PDF, 89 KB)                     [Download]          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  GERELATEERDE PRODUCTEN                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ [Image]  │ │ [Image]  │ │ [Image]  │ │ [Image]  │ │ [Image]  │        │
│  │ DAB Nova │ │ DAB Nova │ │ Wilo TMW │ │ Grundfos │ │ Tsurumi  │        │
│  │ 600 M-A  │ │ 200 M-A  │ │ 32/8     │ │ Unilift  │ │ LB-480   │        │
│  │ €345.67  │ │ €189.00  │ │ €298.00  │ │ €412.00  │ │ €267.00  │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                                              │
│  ACCESSOIRES                                                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                      │
│  │ [Image]  │ │ [Image]  │ │ [Image]  │ │ [Image]  │                      │
│  │ Slang    │ │ Koppeling│ │ Vlotter  │ │ Terugsla │                      │
│  │ 1" 10m   │ │ 1" BSP   │ │ schakel. │ │ klep 1"  │                      │
│  │ €23.45   │ │ €8.90    │ │ €34.50   │ │ €12.00   │                      │
│  │ [+ Cart] │ │ [+ Cart] │ │ [+ Cart] │ │ [+ Cart] │                      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Product Information Tabs

| Tab | Content |
|-----|---------|
| **Specificaties** | Technical specifications table |
| **Documenten** | PDFs, manuals, datasheets |
| **Gerelateerd** | Similar products |
| **Accessoires** | Compatible accessories |

---

### 2.6 Shopping Cart (/winkelwagen)

#### Purpose
Review and manage cart items before checkout.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BREADCRUMB: Dashboard > Winkelwagen                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  H1: Winkelwagen (3 artikelen)                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  CART ITEMS                                                          │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ [img] │ DAB Nova 300 M-A           │ €234.56 │ [-][2][+] │ €469.12 │ [🗑] │
│  │  │       │ SKU: DAB-NOVA300MA         │         │           │         │     │
│  │  │       │ ✅ Op voorraad             │         │           │         │     │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ [img] │ PE-buis 32mm x 100m        │ €89.00  │ [-][1][+] │ €89.00  │ [🗑] │
│  │  │       │ SKU: PE-32-100             │         │           │         │     │
│  │  │       │ ✅ Op voorraad             │         │           │         │     │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ [img] │ Slangkoppeling 1" messing  │ €12.50  │ [-][5][+] │ €62.50  │ [🗑] │
│  │  │       │ SKU: KOPP-1-MESS           │         │           │         │     │
│  │  │       │ ⏳ 2-3 werkdagen           │         │           │         │     │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  [Winkelwagen legen]                    [Opslaan als lijst]         │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ORDER SUMMARY                                                       │   │
│  │                                                                      │   │
│  │  Subtotaal (excl. BTW):              €620.62                        │   │
│  │  BTW (21%):                          €130.33                        │   │
│  │  ─────────────────────────────────────────────                      │   │
│  │  TOTAAL:                             €750.95                        │   │
│  │                                                                      │   │
│  │  Kortingscode: [           ] [Toepassen]                            │   │
│  │                                                                      │   │
│  │  📦 Gratis verzending (boven €100)                                  │   │
│  │  🚚 Verwachte levering: morgen (bestel voor 18:00)                  │   │
│  │                                                                      │   │
│  │  [        AFREKENEN        ]                                        │   │
│  │                                                                      │   │
│  │  [Offerte aanvragen]                                                │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 2.7 Checkout (/winkelwagen/afrekenen)

#### Purpose
Complete the order with shipping and payment details.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BREADCRUMB: Dashboard > Winkelwagen > Afrekenen                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  H1: Afrekenen                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PROGRESS: [1. Adres ●]───[2. Verzending ○]───[3. Betaling ○]───[4. Bevestig ○]│
│                                                                              │
│  ┌─────────────────────────────────────┐  ┌─────────────────────────────┐  │
│  │  STEP 1: LEVERADRES                 │  │  ORDER OVERZICHT            │  │
│  │                                     │  │                             │  │
│  │  ○ Standaard adres                  │  │  3 artikelen                │  │
│  │    Loonwerk Janssens BV             │  │                             │  │
│  │    Industrieweg 123                 │  │  DAB Nova 300 M-A    x2    │  │
│  │    8000 Brugge                      │  │  PE-buis 32mm        x1    │  │
│  │                                     │  │  Slangkoppeling      x5    │  │
│  │  ○ Ander adres                      │  │                             │  │
│  │    [Selecteer of voeg toe]          │  │  ─────────────────────     │  │
│  │                                     │  │  Subtotaal:    €620.62     │  │
│  │  FACTUURADRES                       │  │  Verzending:   €0.00       │  │
│  │  ☑ Zelfde als leveradres           │  │  BTW:          €130.33     │  │
│  │                                     │  │  ─────────────────────     │  │
│  │  REFERENTIE (optioneel)             │  │  TOTAAL:       €750.95     │  │
│  │  [Uw ordernummer/referentie    ]    │  │                             │  │
│  │                                     │  │                             │  │
│  │  OPMERKINGEN                        │  │                             │  │
│  │  [                              ]   │  │                             │  │
│  │  [                              ]   │  │                             │  │
│  │                                     │  │                             │  │
│  │  [Volgende: Verzending →]           │  │                             │  │
│  │                                     │  │                             │  │
│  └─────────────────────────────────────┘  └─────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Checkout Steps

| Step | Content |
|------|---------|
| **1. Adres** | Delivery address, billing address, reference |
| **2. Verzending** | Shipping method selection |
| **3. Betaling** | Payment method (invoice, iDEAL, etc.) |
| **4. Bevestiging** | Order review and confirmation |

---

### 2.8 Order History (/bestellingen)

#### Purpose
View and manage past orders.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BREADCRUMB: Dashboard > Bestellingen                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  H1: Bestellingen                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FILTERS                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Status: [Alle ▼]  Periode: [Laatste 3 maanden ▼]  [🔍 Zoeken]      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ORDER TABLE                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Order #     │ Datum      │ Artikelen │ Bedrag    │ Status    │ Actie│   │
│  │  ───────────────────────────────────────────────────────────────────│   │
│  │  #2024-1234  │ 15 Dec '24 │ 3         │ €750.95   │ 🚚 Onderweg│ [→] │   │
│  │  #2024-1233  │ 12 Dec '24 │ 5         │ €1,234.56 │ ✅ Geleverd│ [↻] │   │
│  │  #2024-1232  │ 10 Dec '24 │ 2         │ €567.89   │ ✅ Geleverd│ [↻] │   │
│  │  #2024-1231  │ 08 Dec '24 │ 8         │ €2,345.00 │ ✅ Geleverd│ [↻] │   │
│  │  #2024-1230  │ 05 Dec '24 │ 1         │ €89.00    │ ✅ Geleverd│ [↻] │   │
│  │  #2024-1229  │ 01 Dec '24 │ 4         │ €456.78   │ ✅ Geleverd│ [↻] │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  PAGINATION                                                                 │
│  [← Vorige] [1] [2] [3] ... [12] [Volgende →]                              │
│                                                                              │
│  EXPORT                                                                     │
│  [📥 Exporteer naar Excel]                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Order Statuses

| Status | Icon | Description |
|--------|------|-------------|
| **Nieuw** | 🆕 | Order received |
| **Verwerking** | ⏳ | Being processed |
| **Verzonden** | 🚚 | Shipped |
| **Onderweg** | 🚚 | In transit |
| **Geleverd** | ✅ | Delivered |
| **Geannuleerd** | ❌ | Cancelled |

---

### 2.9 Account Settings (/account)

#### Purpose
Manage company profile, users, and settings.

#### Subpages

| Page | Content |
|------|---------|
| **/profiel** | Company info, VAT, contact |
| **/gebruikers** | User management, roles |
| **/adressen** | Delivery/billing addresses |
| **/facturen** | Invoice history, download |
| **/betalingen** | Payment history, methods |
| **/instellingen** | Notifications, language, preferences |

---

## 3. Global Components

### 3.1 Header

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo]  [Search.............................] [🛒 Cart(3)] [👤 User▼] [🔔] │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Navigation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Dashboard │ Producten ▼ │ Bestellingen │ Lijsten │ Offertes │ Account ▼    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Search (Global)

- Autocomplete suggestions
- Recent searches
- Search by SKU, name, brand
- Filter results
- AI-powered suggestions

### 3.4 Cart Flyout

```
┌─────────────────────────────┐
│  Winkelwagen (3)            │
│  ─────────────────────────  │
│  [img] Product 1    €123.45 │
│  [img] Product 2    €234.56 │
│  [img] Product 3    €345.67 │
│  ─────────────────────────  │
│  Totaal:           €703.68  │
│  [Bekijk winkelwagen]       │
│  [Afrekenen]                │
└─────────────────────────────┘
```

### 3.5 User Menu

```
┌─────────────────────────────┐
│  👤 Jan Janssens            │
│  Loonwerk Janssens BV       │
│  ─────────────────────────  │
│  📊 Dashboard               │
│  👤 Mijn profiel            │
│  📦 Bestellingen            │
│  📄 Facturen                │
│  ⚙️ Instellingen            │
│  ─────────────────────────  │
│  🚪 Uitloggen               │
└─────────────────────────────┘
```

---

## 4. Mobile Responsiveness

### Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| **Mobile** | <640px | Single column, hamburger menu |
| **Tablet** | 640-1024px | 2 columns, condensed nav |
| **Desktop** | >1024px | Full layout |

### Mobile Navigation

```
┌─────────────────────────────┐
│ [☰] [Logo] [🔍] [🛒] [👤]  │
└─────────────────────────────┘

HAMBURGER MENU:
┌─────────────────────────────┐
│  [X]                        │
│  ─────────────────────────  │
│  Dashboard                  │
│  Producten >                │
│  Bestellingen               │
│  Lijsten                    │
│  Offertes                   │
│  Account >                  │
│  ─────────────────────────  │
│  Support                    │
│  Downloads                  │
│  ─────────────────────────  │
│  Uitloggen                  │
└─────────────────────────────┘
```

---

*Document Classification: Internal*
*Version: 1.0*
*Last Updated: December 2024*
