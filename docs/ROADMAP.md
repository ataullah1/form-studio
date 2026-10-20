# Form Studio Development Roadmap

বাংলা guide এবং English Codex prompts।

# Form Studio Development Roadmap

Md Ataullah এর জন্য সম্পূর্ণ development guide
প্রস্তুত ১৮ অক্টোবর ২০২৬

## Project এর উদ্দেশ্য
একটি কাল্পনিক premium furniture brand এর জন্য interactive desk configurator বানাবেন। Visitor desk ঘুরিয়ে দেখবে, finish এবং size বদলাবে, accessories যোগ করবে, price দেখবে এবং নিজের configuration share বা quote request করবে। English interface বিদেশি furniture brand ও ecommerce agency কে আপনার frontend ও product engineering দেখানোর জন্য তৈরি হবে।

## প্রথম version এ যা থাকবে
- একটি desk model; তিনটি wood finish, দুটি frame colour ও তিনটি নির্ধারিত size।
- Lamp, monitor stand এবং cable tray যোগ বা বাদ দেওয়ার সুযোগ।
- Rotate, zoom, camera reset, day/night lighting এবং প্রয়োজনীয় dimensions।
- Live price breakdown, local draft, immutable share link এবং quote request।
- Restricted admin inbox, mobile controls ও 3D unavailable হলে 2D fallback।
- Public landing page, test evidence, walkthrough ও portfolio case study।

## এখন scope এর বাইরে
পূর্ণ marketplace, payment/checkout, shipping engine, AR room placement, arbitrary furniture upload, AI room generation, subscription billing এবং custom shader editor এখন নয়। Screenshot export optional; core demo শেষ হওয়ার আগে এটি যোগ করবেন না। Product price সব illustrative; real sale বা manufacturing promise নয়।

## প্রথম milestone
একটি visually convincing desk rotate/zoom করা এবং তিনটি finish বদলানো যাবে। Desktop ও real phone এ usable হতে হবে। শুধু রঙিন box বা screenshot হলে milestone complete নয়। কাঠের texture, edge, metal frame, shadow ও camera composition গ্রহণযোগ্য হতে হবে।

## কাজের সময় এবং নিয়ম
AI সহায়তায় প্রতিদিন ৪ থেকে ৬ ঘণ্টা ধরে ২১ থেকে ২৭ কর্মদিবসের planning estimate। 3D নতুন হলে model, materials এবং mobile debugging এ অতিরিক্ত সময় লাগতে পারে। AI coding দ্রুত করলেও visual review ও real-device testing আপনাকে করতে হবে।

Step 0 থেকে Step 12 ক্রমে কাজ করুন। প্রতিটি ধাপের checks পাস করে commit দিন। শেষের Markdown roadmap ও checklist repository তে রাখুন; নতুন Codex session সেখান থেকে কাজ বুঝবে।

# Technology and Architecture

## নির্ধারিত stack
| অংশ | নির্বাচন |
| App | Next.js App Router এবং TypeScript |
| Interface | Tailwind CSS এবং প্রয়োজনীয় shadcn/ui controls |
| 3D engine | Three.js এবং React Three Fiber |
| 3D helpers | Drei এর controls ও loading utilities |
| Shared state | Typed reducer এবং React Context |
| UI motion | Motion শুধু প্রয়োজনীয় transition এ |
| Validation | Zod এবং pure configuration functions |
| Backend | Next.js server handlers, PostgreSQL এবং Prisma |
| Admin identity | Provider-independent authentication এবং server allowlist |
| Hosting and data | Vercel এবং Neon PostgreSQL |
| Verification | Vitest এবং Playwright |

Stable compatible package versions শুরুতে যাচাই ও lock করুন। React, React DOM, Fiber ও Drei peer dependencies একসঙ্গে মিলতে হবে। বর্তমান stable docs ব্যবহার করবেন; /next বা alpha guide ভুল করে ব্যবহার নয়।

## Application boundaries
Public landing page server rendered থাকবে। Configurator এর 3D Canvas client-only module হিসেবে প্রয়োজনের সময় load হবে। Product text, controls ও summary Canvas এর বাইরে সাধারণ HTML থাকবে। Share ও quote request server এ validate হবে; database browser থেকে সরাসরি খোলা নয়।

## Folder এর দায়িত্ব
- features/configurator: state, controls, pure pricing এবং summary।
- features/scene: desk geometry, materials, anchors, lighting এবং camera।
- features/quotes: form, server validation এবং admin workflow।
- lib/catalog: versioned option IDs, dimensions এবং illustrative prices।
- lib/server: db, auth, rate limiting ও authorized queries।
- public/assets: optimized self-hosted textures ও optional GLB।
- docs: ROADMAP, PROGRESS, DECISIONS, ASSETS এবং RUNBOOK।

Redis, dedicated Express server বা separate realtime service দিয়ে শুরু করবেন না। Distributed rate limiting দরকার হলে shared database based atomic limiter দিয়েই MVP করুন। নতুন infrastructure শুধু মাপা প্রয়োজন হলে যোগ করুন।

# Visual Direction and Asset Plan

## Art direction
Brand direction: **Architectural furniture atelier** — bold, tactile, precise এবং product-focused। Review Room থেকে আলাদা identity: warm mineral page #F4EDE3, espresso text/dark section #2B211C, burnt terracotta accent #A3442D, chalk surface #FFFBF5 এবং dark surface এ #F4EDE3 text। Semantic CSS variables থেকে muted text, borders, focus এবং disabled/selection styles ব্যবহার করুন; actual text/background contrast verify করুন। UI থেকে green/olive বাদ; future natural product materials UI palette থেকে স্বাধীন থাকবে।

Typography: next/font দিয়ে upright Bodoni Moda display headings এবং Manrope body/navigation/controls। Oversized headings, asymmetric product composition, square surfaces, fine rules এবং numbered specifications ব্যবহার করুন। Decorative italic emphasis, pill decoration এবং generic rounded-card grids নয়। Main action: Build your desk।

Landing hero থাকবে optimized static illustration/poster; অতিরিক্ত Canvas নয়। Desktop configurator এ সবচেয়ে বড় useful scene area এবং পাশে HTML specification panel; mobile এ viewer-এর পরে controls normal document flow-তে থাকবে। Loading/error boundary, orbit/zoom/reset এবং non-WebGL fallback অক্ষত থাকবে। Full-width development banner নয়; viewer-এর পাশে compact note: “Geometry preview — material and configuration options are in development.” Material library Step 3 পর্যন্ত preview হিসেবে labelled থাকবে এবং unfinished product controls disabled থাকবে। Independent-concept ও illustrative-pricing disclosures স্পষ্ট রাখুন।

Restrained feedback transitions, prefers-reduced-motion এবং normal browser scrolling বজায় রাখুন। অতিরিক্ত glow, particle, custom cursor, continuous decorative animation বা mandatory intro নয়। এটি existing Step 2 screens-এর visual revision; Step 3–12 feature completion নয়। Final product-story expansion এখনও Step 10-এর দায়িত্ব।

## নির্ধারিত product
Working product name Studio Desk 01। Height ৭৪ সেমি; tabletop thickness ৩ সেমি। Width/depth preset ১২০×৬০, ১৪০×৭০ এবং ১৬০×৮০ সেমি। এগুলো demo design dimension; load rating বা ergonomic certification দাবি করবেন না।

## Geometry strategy
প্রথমে rounded tabletop, metal legs এবং crossbar code geometry দিয়ে বানান। Detail ছাড়া cube রেখে final করবেন না। Geometry strategy material ও size customization এ সুবিধা দেবে। Lamp/stand/tray simple geometry দিয়েও তৈরি হতে পারে; polished result না এলে licensed optimized GLB ব্যবহার করুন। Blender শেখা পুরো project এর prerequisite করবেন না।

## Asset checklist
- Oak, walnut এবং ash এর seamless wood base-colour ও প্রয়োজনীয় material maps।
- একটি neutral environment বা lightweight lighting setup।
- যে GLB ব্যবহার করবেন তার node names, origin, units ও material slots লিখুন।
- ASSETS.md এ source URL, creator, license, attribution ও modifications রাখুন।
- Open-source code license third-party texture/model এর license বদলায় না।

## Quality gate
একটি finish এবং default desk দিয়ে screenshot review করুন। Grain scale believable, bevel দৃশ্যমান, পা মাটিতে, accessory overlap নেই, highlights অতিরিক্ত সাদা নয় এবং silhouette সুন্দর হতে হবে। Render এর screenshot promotional imagery হিসেবে ব্যবহার করা যায়; runtime texture হিসেবে perspective desk photo বসাবেন না।

## Performance budget
এগুলো proposed engineering targets, verified result নয়। Initial configurator 3D assets প্রায় ৫ MB compressed transfer এর মধ্যে রাখার চেষ্টা করুন; scene প্রায় ১০০ draw call এবং ১ লক্ষ triangle এর মধ্যে। প্রথমে 1K textures; প্রয়োজন হলে desktop এ 2K। DPR cap প্রায় 1.5, low quality তে 1। Device measurements দেখে targets adjust ও document করুন।

# Configuration Data and Pricing

## একটি canonical configuration
schemaVersion, catalogVersion, productId, sizeId, finishId, frameColourId এবং accessoryIds রাখুন। Arbitrary dimensions, external model URLs বা client-supplied prices গ্রহণ নয়। Accessories unique এবং normalized sorted array হবে। Lighting, camera pose ও quality UI state; product configuration বা price এর অংশ নয়।

## Catalog rules
একটি versioned TypeScript catalog থেকে labels, allowed values, dimensions, compatibility এবং price lookup হবে। Pure shared functions UI তে estimate দেখাবে; server authoritative validation ও price calculation আবার করবে। Catalog পুরোনো version share link থাকলে read support রাখুন; নতুন quote এ current catalog দিয়ে price refresh করুন।

## Illustrative USD price list
| Item | Demo price |
| Desk 120×60 cm | $349 |
| Desk 140×70 cm | $399 |
| Desk 160×80 cm | $449 |
| Oak or ash finish | Included |
| Walnut finish | +$40 |
| Black or white frame | Included |
| Desk lamp | +$45 |
| Monitor stand | +$35 |
| Cable tray | +$20 |

Integer cents এ সব amount রাখুন। Default 140×70, oak, black, accessories ছাড়া $399। Walnut ও তিনটি accessory দিলে $539। Tax ও shipping included নয়; illustrative estimate only লেখা থাকবে।

## Minimal database
SavedConfiguration: random publicId, normalized config JSON, schemaVersion, catalogVersion, saved estimate এবং createdAt। Quote: private contact fields, config snapshot, server estimate, currency, status, idempotency key এবং timestamps। QuoteStatusEvent: actor, old/new status ও timestamp। RateLimitBucket: scoped hashed key, window ও atomic count।

Share record public কিন্তু কোনো personal data থাকবে না। Quote contact information share response এ যাবে না। Saved configuration immutable; পরিবর্তন করে save দিলে নতুন link। Customer login বা account ছাড়া guest save/share করা যাবে।

# Steps 0 and 1 Scope and Setup

## Step 0 Product and screen plan
সময় ১ দিন। Dependency নেই।
- docs/ROADMAP.md এবং docs/PROGRESS.md তৈরি করুন।
- Scope, catalog, price examples, visual references ও supported sizes স্থির করুন।
- Landing hero, desktop configurator ও mobile configurator এর static layout বানান।
- docs/ASSETS.md এবং docs/DECISIONS.md রাখুন।

Done যখন: scene, controls, price summary ও quote entry কোথায় থাকবে পরিষ্কার। Placeholder কে final model হিসেবে দেখানো হয়নি।

Codex prompt
Read docs/ROADMAP.md fully. Complete Step 0 only. Create the scope, catalog specification, asset register, progress tracker and static desktop/mobile screen layouts. Keep English product copy and clearly illustrative pricing. Do not add checkout, AI or a furniture marketplace.

## Step 1 Repository and 3D integration
সময় ১ দিন। Dependency Step 0।
- Portfolio থেকে আলাদা repository তৈরি করুন। pnpm packageManager এবং lockfile pin করুন।
- Compatible Next.js, React, Three.js, Fiber ও Drei versions verify করুন।
- Client-only scene boundary, loading state এবং Canvas error boundary দিন।
- App shell, typed catalog, lint, typecheck, unit test ও build scripts রাখুন।
- Browser capability failure এ 2D schematic fallback দেখান; quote form চালু থাকবে।

Done যখন: application fresh checkout থেকে চলে, test scene দৃশ্যমান, hydration error নেই এবং build পাস। 3D code landing page এর critical initial bundle এ চাপিয়ে দেওয়া হয়নি।

Codex prompt
Complete Step 1 only. Verify stable peer-compatible versions using official documentation. Configure a client-only R3F scene, loading/error boundaries, typed catalog and meaningful quality scripts. Keep HTML content outside the canvas and preserve a working non-WebGL fallback. Do not deploy or push.

আপনার review: SSR page এবং client-only Canvas এর পার্থক্য code দেখে বুঝুন। Dependency mismatch থাকলে geometry কাজ শুরু করবেন না।

# Step 2 Desk Geometry and Camera

সময় ২ থেকে ৩ দিন। Dependency Step 1।

## কী বানাবেন
- Default 140×70 cm desk; metre-based units, origin এবং floor level document করুন।
- Rounded tabletop, correctly proportioned legs, frame ও crossbar।
- Top surface এবং floor reference স্পষ্ট রাখুন; table top y = 0.74 m।
- নিরপেক্ষ material, simple lights ও convincing contact shadow।
- একটি default three-quarter camera, orbit limits, zoom limits এবং Reset View।
- Portrait ও landscape container অনুযায়ী camera framing।

## Geometry implementation
Tabletop thickness 0.03 m হলে centre y = 0.725 m। Leg height, crossbar ও support positions surface height থেকে হিসাব করুন। Size বদলানোর সুবিধার জন্য dimensions একটি pure function থেকে নিন। Bevel/rounded edges parameterized হবে। পুরো model এর non-uniform scale দিয়ে thickness, lamp বা frame বিকৃত করবেন না।

## Acceptance checks
- Desk floor এ বসে; পা বা frame ভাসে না।
- Reset View যেকোনো valid camera pose থেকে desk দেখায়।
- Camera tabletop এর ভেতরে ঢোকে না এবং underside এ আটকে যায় না।
- Mobile portrait এ desk বা accessories clip হয় না।
- Repeated navigation এ duplicate Canvas/context বা render loop leak হয় না।

## Codex prompt
Complete Step 2 only. Build a parameterized desk with documented metre units, beveled tabletop, separate frame parts and a floor reference. Derive dimensions through pure functions instead of scaling the entire group. Add bounded orbit/zoom and responsive reset framing. Verify desktop and portrait mobile views. Do not add materials, accessories or backend features yet.

## আপনার শেখার বিষয়
Scene, mesh, geometry, material, camera, light এবং world/local position এর ভূমিকা বুঝুন। AI কে model component এবং dimension calculation ব্যাখ্যা করতে বলুন। Geometry ঠিক না হলে texture দিয়ে সমস্যা ঢাকবেন না।

# Step 3 Materials and Visual Quality

সময় ৩ থেকে ৪ দিন। Dependency Step 2।

## কী বানাবেন
- Oak, walnut এবং ash এর visually distinct material preset।
- Separate tabletop এবং frame material; frame black/white নির্বাচন।
- Wood grain direction, scale, roughness এবং normal strength ঠিক করুন।
- Smooth finish transition; নতুন selection সঙ্গে সঙ্গে UI summary তে থাকবে।
- Loading failure এ neutral usable material; retry বা fallback message।

## Asset and rendering rules
নিজস্ব বা licensed textures self-host করুন। Colour maps এর জন্য যথাযথ sRGB annotation; normal/roughness এর মতো data maps colour transform পাবে না। glTF material loader এর automatic setup অকারণে override করবেন না। Mirrored/stretched grain, overly glossy wood ও blown-out highlights fix করুন।

একই cached material বা texture object mutate করলে অন্য mesh/configuration এ unintended change হতে পারে। যে resource share করছেন তার ownership নির্ধারণ করুন; প্রয়োজন হলে controlled clone, memoization ও disposal strategy রাখুন। Texture preload সীমিত হবে, অকারণে সব 4K asset load নয়।

## Acceptance checks
- তিনটি finish শুধু আলাদা tint নয়; grain ও material appearance বিশ্বাসযোগ্য।
- Frame colour বদলালে tabletop বদলায় না।
- Finish toggle ৩০ বার করলেও crash বা অবিরত GPU resource growth নেই।
- Default framing desktop ও real phone এ acceptable।
- ASSETS.md এ প্রতিটি external asset এর license ও attribution আছে।

## Codex prompt
Complete Step 3 only. Add three licensed self-hosted wood presets and two frame colours with correct colour-space handling and believable grain scale. Keep resource ownership explicit and avoid uncontrolled mutation of cached assets. Add loading/failure states. Review screenshots and test repeated material changes on a real phone where available. Report unverified device checks honestly.

প্রথম milestone এখন পাস হতে হবে: সুন্দর desk, rotate/zoom এবং finish change। এই ফলাফল গ্রহণযোগ্য না হওয়া পর্যন্ত backend শুরু করবেন না।

# Step 4 Sizes and Accessories

সময় ২ দিন। Dependency Step 3।

## Configuration controls
- 120×60, 140×70 এবং 160×80 cm size selector।
- Frame spacing ও support length size অনুযায়ী derive করুন।
- Lamp, monitor stand এবং cable tray toggle।
- Default fixed accessory positions; free drag বা arbitrary placement এখন নয়।
- Readable dimensions ও product summary।

## Anchor strategy
Desktop edges ও tabletop height থেকে accessory anchors হিসাব করুন। Lamp back-left, stand rear-centre এবং tray underside-rear centre এ থাকবে। Table width বদলালে edge clearance একই থাকবে। Monitor stand tabletop এর ওপরে, tray নিচে; কোনো accessory material বা dimension table resize এর সঙ্গে stretch হবে না।

একটি typed reducer/Context হবে canonical state। Scene, controls, price এবং share payload একই normalized configuration পড়বে। UI component এ আলাদা competing config state রাখবেন না। Unknown IDs normalize silently করে quote বানানোর বদলে invalid input স্পষ্ট reject করুন।

## Acceptance checks
- তিনটি size এবং সব accessory on অবস্থায় overlap/clip নেই।
- Rapid toggle এবং size change এ stale object থাকে না।
- DOM summary এবং 3D scene একই selection দেখায়।
- Reset Configuration default product state ফিরিয়ে দেয়।
- Quantity fixed one; একই accessory দ্বিতীয়বার যোগ হয় না।

## Codex prompt
Complete Step 4 only. Implement typed canonical configuration state, three size presets and fixed-anchor lamp, monitor stand and cable tray. Recompute frame and accessory anchors from physical dimensions. Keep accessory dimensions independent of desk size. Test all size/accessory combinations and ensure controls, scene and summary share one normalized state.

এটি CAD বা manufacturing application নয়। Material/price অনুযায়ী fixed catalog selections এবং reliable state update এই version এর লক্ষ্য।

# Step 5 Lighting and Interaction

সময় ১ থেকে ২ দিন। Dependency Step 4।

## Visual interaction
- Day ও night lighting preset; camera position অপরিবর্তিত।
- Lamp selected থাকলে night scene এ restrained light contribution।
- Desk দেখতে Front, Detail এবং Reset camera buttons।
- Camera transition সীমিত; reduced motion হলে immediate বা minimal transition।
- OrbitControls অথবা CameraControls এর একটি বেছে নিন; একই Canvas এ conflicting controls নয়।

## Mobile behaviour
Scene drag/pinch এবং document scroll আলাদা ও বোধগম্য রাখুন। Canvas পুরো page scroll আটকাবে না। Controls এর বাইরে vertical scroll চলবে; 3D interaction area স্পষ্ট দেখান। Touch target বড় এবং button label পরিষ্কার রাখুন। Colour swatch keyboard দিয়ে select করা যাবে এবং selected state text এও বোঝা যাবে।

## Render policy
Resting scene এ demand rendering ব্যবহার করুন। Controls, material/lighting state এবং camera transition এ প্রয়োজনীয় invalidation হবে। Hidden বা offscreen viewer এ কাজ সীমিত করুন। Auto-rotate default off; perpetual animation loop রাখবেন না। Dynamic shadow updates প্রয়োজনমতো সীমিত করুন।

## Acceptance checks
- Day/night toggle price বা saved product selection বদলায় না।
- Night এ tabletop readable; scene সম্পূর্ণ অন্ধকার নয়।
- Idle অবস্থায় অকারণে continuous render চলে না।
- Pinch/drag এর পর user controls ও quote form ব্যবহার করতে পারে।
- WebGL context lost হলে recovery বা 2D mode পাওয়া যায়।

## Codex prompt
Complete Step 5 only. Add day/night presets, restrained lamp lighting, bounded camera presets and accessible mobile interactions. Use a single camera-control system and demand rendering with correct invalidation. Respect reduced motion and provide recovery or a working 2D fallback after context failure. Keep appearance settings separate from product configuration.

# Step 6 Pricing and Local Draft

সময় ১ থেকে ২ দিন। Dependency Step 5।

## Pricing engine
Versioned catalog থেকে pure validateConfig এবং calculatePrice functions তৈরি করুন। Amount integer cents; UI তে Intl.NumberFormat দিয়ে USD display। Product subtotal এবং নির্বাচিত surcharge আলাদা দেখান। Shipping/tax unavailable হলে estimated total বলে পরিষ্কার করুন।

## নির্দিষ্ট regression cases
- Default desk $399।
- Default size plus walnut plus all accessories $539।
- Small desk plus cable tray $369।
- Day/night বা camera change এ subtotal অপরিবর্তিত।
- Duplicate accessory IDs, unknown size ও injected price value rejected।

## Local draft
Debounced localStorage save করুন; schemaVersion এবং catalogVersion সহ product configuration রাখুন। Name/email/quote message localStorage এ রাখবেন না। Storage blocked বা quota error হলে session usable থাকবে। Corrupt বা obsolete draft এ clear reset path দিন।

Initial hydration এর সময় draft এবং defaults flash/mismatch করবে না। User explicit shared URL খুললে সেই snapshot local draft এর চেয়ে priority পাবে; unsaved edit হলে copy হিসেবে local draft রাখুন। Share load পুরোনো global draft দিয়ে override হবে না।

## Acceptance checks
Refresh এ valid draft ফিরে আসে। Reset Configuration সংরক্ষিত default state ও UI একই করে। Duplicate accessory price double count হয় না। No storage mode এ app কাজ করে। 2D fallback এর summary canonical config অনুযায়ী update হয়।

## Codex prompt
Complete Step 6 only. Implement versioned pure config validation, integer-cent pricing and itemized illustrative USD estimates. Add documented golden-price tests and reject malformed configuration. Persist only validated product state locally with schema-version handling and a safe no-storage path. Define and test shared-URL priority over local drafts.

এখনও server নেই বলে price security verified নয়। পরের ধাপে server একই validated rules দিয়ে estimate পুনরায় হিসাব করবে।

# Step 7 Save and Share Backend

সময় ২ দিন। Dependency Step 6।

## কী বানাবেন
- Neon PostgreSQL (user-selected; replaces Supabase), Prisma migration ও environment placeholders।
- POST configuration save; GET /s/[publicId] shared configuration page।
- Server normalized IDs, schema/catalog version ও compatibility যাচাই করে immutable snapshot রাখবে।
- Opaque random public ID; customer data বা secret token এতে থাকবে না।
- Share page এ version ও selection summary এবং Edit a Copy action।

## Server rules
Client total, arbitrary material URL বা serialized JS trust নয়। Server calculatePrice দিয়ে estimate হিসাব করবে। Application tables browser Data API থেকে বন্ধ বা যথাযথ grants/RLS দিয়ে restricted থাকবে। Prisma request browser user context স্বয়ংক্রিয়ভাবে বহন করে ধরে নেবেন না।

Save endpoint এ payload limit এবং shared atomic rate limiter দিন। Multi-instance deployment এ শুধু process memory limiter যথেষ্ট নয়। Same idempotency key ও payload safe retry হবে; conflicting payload হলে reject। Public saved config immutable, তাই account বা edit authorization এখন দরকার নেই।

## Version compatibility
Shared configuration পুরোনো catalog version এর visual options resolve করতে পারবে। Deprecated option এর জন্য clear unavailable state দিন। নতুন quote করতে চাইলে current catalog estimate refresh করুন; saved old price কে আজকের price হিসেবে দেখাবেন না।

## Acceptance checks
এক browser থেকে save link অন্য browser এ খুললে একই size/finish/accessories ফিরে আসে। Local draft shared link override করে না। Unknown publicId friendly not-found দেখায়। Malformed/oversize save rejected। Public response এ quote email বা admin detail নেই।

## Codex prompt
Complete Step 7 only. Add Prisma/Postgres persistence for immutable public configuration snapshots. Validate catalog/schema versions and recalculate estimates server-side. Implement opaque public IDs, idempotent saves, payload limits and shared atomic rate limits. Restrict browser access to application tables. Test cross-browser restoration, stale catalogs, invalid IDs and local-draft precedence.

# Step 8 Quote Request Workflow

সময় ২ দিন। Dependency Step 7।

## Form fields
Name, email, optional company/country এবং short project message রাখুন। Selected desk summary পাশে থাকবে। Budget বা delivery promise invent করবেন না। Submit এ visitor বুঝবে এটি concept demo request; বাস্তবে furniture order হবে না।

## Server workflow
- Server config IDs validate করে current catalog দিয়ে price snapshot বানাবে।
- Old share catalog হলে updated estimate দেখিয়ে user কে confirm করতে দিন।
- Quote record এ normalized configuration, catalog version এবং authoritative price রাখুন।
- Unique idempotency key, honeypot, bounded input এবং atomic rate limits দিন।
- Success state শুধু database write নিশ্চিত হলে দেখান।
- Email sending initial scope এ নেই; stored request admin inbox এ দেখা যাবে।

## Privacy boundary
Quote public share response থেকে আলাদা। Public reference চাইলে opaque reference দিয়ে acknowledgment দেখান, contact fields দিয়ে public lookup নয়। Raw input, email বা message server logs এ নয়। Repository বা seed এ real enquiries নয়। Public demo চাইলে fictional test details ব্যবহার করতে বলুন; purge job দিয়ে demo quote contact data ৭ দিনের মধ্যে মুছুন। Public saved setups এ PII রাখা যাবে না।

## Acceptance checks
Invalid email rejected। Client total $1 পাঠালেও server catalog estimate থাকে। Double submit একটি quote বানায়। DB failure এ false success নয়; input বজায় থাকে। Admin ছাড়া quote list বা guessed ID থেকে contact পাওয়া যায় না। Long text বা scripted content execute হয় না।

## Codex prompt
Complete Step 8 only. Implement a clearly labelled demo quote form, server-authoritative current-catalog price snapshots, idempotent persistence, anti-abuse limits and reliable success/error states. Keep quote PII private and out of public shares, logs and localStorage. Add a documented seven-day demo-data cleanup path. Do not send email, take payments or imply a real order was placed.

# Step 9 Restricted Admin Inbox

সময় ১ থেকে ২ দিন। Dependency Step 8।

## Admin scope
শুধু আপনার quote inbox; customer login বা public signup dashboard নয়। Provider-independent verified login এবং server-controlled allowed user IDs ব্যবহার করুন। Allowlist .env বা server configuration এ থাকবে। নতুন user ID client request বা public sign up দিয়ে admin হতে পারবে না।

## প্রয়োজনীয় screens
- /admin/login এবং protected /admin/quotes।
- Paginated list: created date, name, product summary এবং status।
- Quote detail: private contact, original config snapshot ও saved estimate।
- Status NEW, REVIEWING, CLOSED; প্রতিটি পরিবর্তনের history।
- Filter by status; private response public cache এ যাবে না।

## Authentication rules
নির্বাচিত authentication provider-এর official server-side integration অনুসরণ করুন; Supabase প্রয়োজন নেই। Browser redirect শুধু UX; প্রতিটি private query ও mutation এ verified identity এবং allowlist check হবে। Service-role key, DB credentials বা auth secret কখনো NEXT_PUBLIC prefix পাবে না। Open redirect এ external return URL ব্যবহার নয়।

## Acceptance checks
Logged-out এবং non-allowlisted authenticated user দুজনেই quote data পায় না। URL বা action replay দিয়ে admin status change হয় না। Own admin session detail দেখে status update করতে পারে। Cross-tab state stale হলে refreshed value দেখায়। Public demo admin access পাবে না।

## Codex prompt
Complete Step 9 only. Add a minimal authenticated admin quote inbox (Neon database; auth provider to be selected) with a server-maintained user-ID allowlist. Protect every private read and status mutation. Add pagination, status filter and transactional status history. Test logged-out, non-allowlisted and replayed requests. Do not expose customer contact data through public routes or shared caches.

Public portfolio walkthrough এ admin অংশ দেখাতে হলে fictional seed data ব্যবহার করুন। নিজের actual enquiries screen record করবেন না।

# Step 10 Product Story and Discovery

সময় ১ দিন। Dependency Step 9।

## Landing content
প্রথম screen এ product, value এবং Build your desk action থাকবে। Visitor interaction করার আগে lengthy intro animation দেখবে না। Sections: product hero, customization preview, material detail, dimensions, how it works এবং concept FAQ। Working brand name Form Studio; domain বা trademark availability এই roadmap এ যাচাই করা হয়নি।

## Motion direction
একটি strong hero transition এবং restrained material-detail reveal যথেষ্ট। Normal browser scroll বজায় রাখুন। Product controls scroll progress এর ওপর নির্ভরশীল নয়। Initial hero তে optimized poster দেখান; 3D viewer visible বা requested হলে load হবে। দুটি concurrent Canvas নয়।

## SEO and analytics
Public landing এর title, description, canonical ও social preview দিন। Sitemap এ public explanatory page রাখুন। Generated /s links এবং admin pages noindex; noindex access control নয়। Browser analytics থাকলে finish selection, configurator start ও quote success এর মতো event রাখুন; name/email/message capture নয়। User interaction ছাড়া quote-success event fire হবে না।

## Acceptance checks
JavaScript/3D load হওয়ার আগেও product information এবং primary link বোঝা যায়। Button configurator খোলে; hero animation form বা navigation আটকায় না। সব capability ও price claim implemented behaviour এর সঙ্গে মেলে। Fake review, stock count বা sales number নেই।

## Codex prompt
Complete Step 10 only. Build a polished English product-story landing page with a lightweight poster and clear configurator entry. Use restrained motion, normal scrolling and a single active viewer. Add public metadata and index exclusions for generated/admin routes. Keep analytics optional and PII-free. Make only claims supported by the working demo.

Landing এর সুন্দর screenshot এর পাশাপাশি actual interaction দেখানো video রাখুন। বিদেশি client যেন বুঝতে পারে এটি একটি usable product experience।

# Step 11 Tests and Mobile Performance

সময় ৩ থেকে ৪ দিন। Dependency Step 10।

## Functional coverage
| Test area | Required result |
| Catalog | সব valid option resolve; unknown/duplicate IDs rejected |
| Price | Default $399; walnut/all extras $539; small/tray $369 |
| Geometry | সব size এ anchors ও clearance consistent |
| Persistence | Refresh ও cross-browser share restore consistent |
| Quote | Current server price; duplicate submit safe |
| Admin | Logged out/non-admin access denied |
| Fallback | No WebGL তেও controls, summary ও quote usable |

## বাস্তব browser checks
360, 390, 768 এবং 1440 px এ controls, summary ও sticky UI দেখুন। অন্তত একটি real iPhone/Safari এবং সুযোগ থাকলে mid-range Android/Chrome এ ঘুরিয়ে দেখুন। Headless browser rendering physical mobile GPU test এর বিকল্প নয়। Pinch, scroll, orientation change এবং background/resume পরীক্ষা করুন।

## Performance gate
Development mode নয়, production build মাপুন। Representative phone এ drag করার সময় প্রায় ৩০ FPS বা ভালো usability লক্ষ্য; desktop এ প্রায় ৬০ FPS target। ফলাফল guarantee নয়। Device, browser, quality preset ও measured result PERFORMANCE.md এ লিখুন। Initial asset bytes, draw calls ও triangles আগের budget এর সঙ্গে তুলনা করুন।

Idle scene unnecessary rendering করবে না। Low-quality preset shadow, texture/DPR কমাবে; visual product selection বদলাবে না। Model/texture failure, context lost, database outage, rate limit এবং expired admin session এর UI যাচাই করুন। Accessory toggle repeated হলে memory/resource behaviour দেখুন।

## Codex prompt
Complete Step 11 only. Run catalog/pricing/state/API authorization and critical browser tests. Measure a production build against the roadmap asset and interaction targets. Check real devices where available and label unavailable checks honestly. Fix concrete failures, maintain a functional non-WebGL mode and record measured evidence. Do not report unsupported Lighthouse scores or FPS claims.

Visual tests একা যথেষ্ট নয়; state, permission এবং server price এর focused tests অপরিহার্য।

# Step 12 Release and Portfolio

সময় ১ দিন। Dependency Step 11।

## Release preparation
- Environment example, setup README ও migration order document করুন।
- Development/staging এবং production data আলাদা; preview production DB লিখবে না।
- Assets self-hosted এবং license manifest সম্পূর্ণ।
- Auth redirect, app URL, connection pooling ও hosting limits যাচাই করুন।
- Backup ও recovery path লিখুন; destructive reset production এ নয়।
- Rate limiter এবং demo quote cleanup deployed environment এ চলে কি না দেখুন।

## Live smoke checklist
Fresh browser থেকে desk customize, save, অন্য browser এ link open, edit copy এবং demo quote submit করুন। Admin test account দিয়ে fictional quote দেখুন। Non-admin access denied এবং fallback usable নিশ্চিত করুন। Broken URL/texture request বা console error থাকলে release complete নয়।

## Portfolio package
Title: Form Studio Interactive Desk Configurator। One-line description: A 3D product experience with customizable finishes, live pricing and shareable desk setups। Live Demo, ৬০ থেকে ৯০ সেকেন্ড walkthrough এবং concise case study দিন।

Case study তে problem, নিজের ভূমিকা, geometry/material decisions, canonical config, server pricing এবং mobile performance evidence লিখুন। Independent concept project হিসেবে চিহ্নিত করুন। Working benchmark ছাড়া conversion gain, sales বা client results লিখবেন না।

## Codex prompt
Complete Step 12 preparation. Write setup, deployment, migration, backup/recovery, quota and cleanup runbooks. Run final checks and draft the portfolio case study from implemented features and recorded measurements. Do not push, deploy, run production migrations, send enquiries or purchase services automatically. List remaining manual release steps without revealing secrets.

## Definition of done
Core demo সত্যিকারের interactive; finish, size ও accessories scene এবং price দুজায়গায় সঠিক। Share restore এবং quote persistence কাজ করে। Private data protected। Mobile/fallback tested বা limits স্পষ্ট। README, asset license record ও walkthrough প্রস্তুত।

আপনি release করার পর feedback অনুযায়ী screenshot export, Shopify integration বা additional product যোগ করতে পারেন; এই first version এর completion এগুলোর ওপর নির্ভর করবে না।

# Codex Prompts and Daily Workflow

## প্রথম session এর master prompt
I am building Form Studio, an independent portfolio project for foreign furniture and ecommerce clients. Read docs/ROADMAP.md in full and inspect repository instructions. Follow its product scope, canonical configuration, asset license rules and step dependencies. Build one configurable desk rather than a marketplace. Use English UI copy and illustrative prices.

Work on the requested step only. Before coding, state the acceptance checks briefly. Implement, run meaningful checks, then update docs/PROGRESS.md with changed files, evidence, remaining limits and the next step. Verify stable React/Fiber/Three/Drei compatibility. Keep product controls and summaries usable outside WebGL. Do not invent benchmarks, asset licenses or completed tests. Do not push, deploy, buy services or modify production data.

## প্রতিদিন শুরু করার prompt
Read docs/ROADMAP.md and docs/PROGRESS.md. Inspect the current implementation and identify the first incomplete step. Complete Step N only, including its acceptance checks. Fix broken prerequisites before continuing and record important decisions. Preserve existing working behaviour and avoid unrelated refactors.

## Visual refinement prompt
Review the current desk at default and mobile portrait views. Check proportions, bevels, wood grain scale, metal roughness, floor contact, exposure and accessory clearance. Fix the specific visual defects I describe. Do not replace the scene with an image, add expensive effects to hide poor materials or change product configuration rules.

## Bug fix prompt
Reproduce this issue: [steps and actual result]. Expected: [result]. Find the root cause in state, geometry, asset loading or server handling. Add a focused regression check where useful, implement the smallest coherent fix and rerun relevant tests. Do not hardcode mock success or bypass validation.

## আপনার দৈনিক review
- অন্তত একটি real user flow নিজে চালান; invalid input বা failure path দেখুন।
- AI কে code দিয়ে dimension, anchor ও price calculation ব্যাখ্যা করতে বলুন।
- Visual change এ desktop এবং phone screenshot তুলনা করুন।
- Verified checks লিখে working change commit করুন।
- Next session এর task PROGRESS.md এ রেখে দিন।

এক prompt এ পুরো product বানাতে বললে debugging কঠিন হবে। Step এর prompt দিয়ে ছোট feature শেষ করুন এবং acceptance evidence দেখে এগোন।

# Schedule and Completion Checklist

## সময় পরিকল্পনা
| ধাপ | কাজ | কর্মদিবস |
| 0 and 1 | Scope, screens এবং setup | 2 |
| 2 | Geometry ও camera | 2 to 3 |
| 3 | Materials ও visual gate | 3 to 4 |
| 4 | Sizes ও accessories | 2 |
| 5 and 6 | Lighting, pricing ও draft | 2 to 4 |
| 7 and 8 | Share backend ও quote | 4 |
| 9 and 10 | Admin ও product story | 2 to 3 |
| 11 and 12 | Verification ও release | 4 to 5 |
| Total | প্রতিদিন 4 to 6 ঘণ্টা | 21 to 27 |

এটি planning estimate; আপনার Review Room দ্রুত শেষ হয়েছে বলে 3D-ও একই সময়ে হবে ধরে নেওয়া ঠিক হবে না। সবচেয়ে বেশি uncertainty materials, assets এবং device performance এ। সপ্তাহে ছয় দিন কাজ করলে প্রায় ৪ থেকে ৫ সপ্তাহ রাখুন; custom model বানানো বা নতুন library শেখায় buffer বাড়ান।

## Completion checklist
- Step 0 Scope এবং three screen layouts agreed।
- Step 1 Compatible setup এবং client scene build passes।
- Step 2 Correct desk proportions এবং responsive camera।
- Step 3 Materials accepted on desktop and phone।
- Step 4 Sizes/accessories state and geometry agree।
- Step 5 Lighting/controls এবং demand rendering work।
- Step 6 Golden pricing tests এবং local draft pass।
- Step 7 Immutable cross-browser share works।
- Step 8 Quote server snapshot ও privacy pass।
- Step 9 Admin allowlist tests pass।
- Step 10 Landing content ও actual functionality agree।
- Step 11 Failure paths, fallback এবং performance checked।
- Step 12 Live smoke, README ও case study complete।

## প্রথম দিন কী করবেন
নতুন repository তে Markdown roadmap docs/ROADMAP.md নামে এবং checklist docs/PROGRESS.md নামে রাখুন। Codex কে master prompt এবং Step 0 prompt দিন। প্রথম দিন scope ও layout শেষ করুন; একই session এ backend, 3D polish এবং quote system একসঙ্গে শুরু নয়।

# Official Technical References

১৮ অক্টোবর ২০২৬ এ official documentation দেখে এই implementation guidance তৈরি করা হয়েছে। Selected version এর API কাজের সময় আবার মিলিয়ে নেবেন। নিচের references package behaviour বোঝার জন্য; scope, price ও performance budgets এই project এর পরিকল্পিত সিদ্ধান্ত।

## React Three Fiber installation
https://r3f.docs.pmnd.rs/getting-started/installation
React/Fiber compatibility এবং framework setup।

## React Three Fiber performance
https://r3f.docs.pmnd.rs/advanced/scaling-performance
On-demand rendering, invalidation, resource reuse ও adaptive quality।

## React Three Fiber Canvas
https://r3f.docs.pmnd.rs/api/canvas
Canvas configuration ও fallback options।

## Drei controls
https://drei.docs.pmnd.rs/controls/introduction
Camera controls এবং rendering integration।

## Drei glTF loading
https://drei.docs.pmnd.rs/loaders/gltf-use-gltf
Optional licensed GLB load করার helper।

## Three js colour management
https://threejs.org/manual/pages/color-management.html
Colour texture ও data texture handling।

## Next js authentication
https://nextjs.org/docs/app/guides/authentication
Server authorization এবং protected data access।

## Supabase server side auth
https://supabase.com/docs/guides/auth/server-side/creating-a-client
Admin login এর verified server identity ও cookies।

## Supabase Prisma
https://supabase.com/docs/guides/database/prisma
Database connection এবং migrations এর setup।

## Release note
Asset rights, hosting quota ও provider price নিজ নিজ provider থেকে launch এর আগে যাচাই করবেন। Documentation link API compatibility বা free-tier capacity এর স্থায়ী নিশ্চয়তা নয়।
