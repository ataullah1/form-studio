# Catalog specification — version 1

Planned canonical configuration:

```json
{
  "schemaVersion": 1,
  "catalogVersion": "1",
  "productId": "studio-desk-01",
  "sizeId": "140x70",
  "finishId": "oak",
  "frameColourId": "black",
  "accessoryIds": []
}
```

IDs are fixed, case-sensitive values. Accessory IDs must be unique, normalized to sorted order; unknown IDs, duplicate IDs and unexpected pricing/model URL fields must be rejected. Quantity is fixed at one. All listed options are compatible in catalog 1.

| Category | ID | Label | Dimensions (metres) | Price/surcharge (USD cents) |
| --- | --- | --- | --- | --- |
| Size | 120x60 | 120 × 60 cm | 1.20 × 0.60 | 34900 |
| Size | 140x70 | 140 × 70 cm | 1.40 × 0.70 | 39900 |
| Size | 160x80 | 160 × 80 cm | 1.60 × 0.80 | 44900 |
| Finish | oak | Oak | — | 0 |
| Finish | walnut | Walnut | — | 4000 |
| Finish | ash | Ash | — | 0 |
| Frame | black | Black | — | 0 |
| Frame | white | White | — | 0 |
| Accessory | lamp | Desk lamp | Fixed geometry, defined in Step 4 | 4500 |
| Accessory | monitor-stand | Monitor stand | Fixed geometry, defined in Step 4 | 3500 |
| Accessory | cable-tray | Cable tray | Fixed geometry, defined in Step 4 | 2000 |

Surface top: y = 0.74 m. Thickness: 0.03 m. Tabletop centre: y = 0.725 m. Floor: y = 0. Width/depth vary through geometry parameters, not whole-scene scaling. No load rating or ergonomic certification claim.

Default: 140x70 / oak / black / no accessories = $399. Default size + walnut + all extras = $539. 120x60 + oak + black + cable-tray = $369. Amounts are integer cents; display with USD Intl.NumberFormat. Prices are illustrative and exclude tax/shipping.

Camera, lighting, dimensions visibility and quality are UI state, outside product configuration and pricing. Future typed catalog, validation and pure pricing functions must implement this specification in Step 1/6, with server recalculation in Step 7/8. Retain versioned catalog readers for old public shares; new quotes use the current catalog with explicit estimate confirmation when changed.
