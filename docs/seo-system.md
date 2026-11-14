# SEO housecarewiki.com: система traffic.law, адаптированная под home care

Дата: 02.11.2026. Основа — `traffic.law/docs/seo-system.md` (7 слоёв). Здесь — что из неё уже работает
на housecarewiki, что добавлено сейчас и что может сделать только команда.

---

## 1. Состояние по слоям

| Слой traffic.law | housecarewiki | Где в коде |
|---|---|---|
| 1. Технический фундамент | ✅ canonical, robots, 404 через `dynamicParams=false`, noindex для пустых страниц, security-заголовки, WebP | `src/app/robots.ts`, `next.config.mjs` |
| 2. Единый источник SEO-данных | ✅ `SITE`, `buildMetadata`, библиотека JSON-LD с `@graph` и `@id` | `src/lib/site.ts`, `src/lib/seo.ts`, `src/lib/schema.ts` |
| 3. Модель контента + валидатор | ✅ блокирует сборку (дубли title/интентов, нет источника/FAQ, битые ссылки) | `scripts/validate-content.cjs` |
| 4. Кластеры (хаб → комната → статья) | ✅ комнаты с `ItemList`, «похожие», крошки | `src/app/rooms/[slug]` |
| 5а. Evergreen-контент | 🟡 **196 статей** (14.11: +8 — хлорка и нашатырь, сковорода из углеродистой стали, кухонный комбайн, камень для пиццы, плесень на подоконниках, стирка наматрасника, френч-пресс, кружка Stanley; 13.11: +8 — электроодеяло, шерстяное пальто, кожаный диван, воск на дереве, декальцинация Nespresso, очиститель воздуха, силиконовый коврик для выпечки, ножи в посудомойке; 12.11: +8 — Instant Pot, мультиварка, YETI в посудомойке, обогреватель, зола из камина, соль на кожаных ботинках, утяжелённое одеяло, диван из микрофибры; 11.11: +8 — увлажнитель, вентиляция сушилки, стекло камина, конденсат на окнах, Keurig, миксер KitchenAid, уксус на паркете, стирка подушек; 10.11: +8 — подливка и смола на одежде, утилизация жира, противень, стеклянная форма, фольга на дне духовки, шерстяной свитер, угги; 09.11: +8 — противень, эмалированная кастрюля, серебро, пуховое одеяло и пуховик, соль на паркете и ковре, паровая швабра на паркете; 02.11: 140 новых гайдов — пятна, how to clean, запахи, безопасность химии, ванная, кухня, полы, стирка; план тем до 200 — в работе остановлен); цель 100–150, у traffic.law рост дал переход 45 → 339 URL | `src/lib/content/guides/`, `src/lib/seed-data.ts` |
| 5б. Радар свежести | ⚪ для home care это сезонность (см. раздел 4) | — |
| 6. Доверие (E-E-A-T) | 🟡 механизм подписи эксперта есть, подписанных статей нет; `sameAs` пуст | `Article.reviewedBy`, `SITE.sameAs` |
| 7. Измерение | 🟡 GA4 + Clarity через GTM; IndexNow теперь по изменениям | `scripts/indexnow.cjs` |

## 2. Что добавлено 02.11.2026

Аналоги схем traffic.law под тематику:

| traffic.law | housecarewiki |
|---|---|
| `LegalService` + практики (`knowsAbout`) | `Organization` издателя: `knowsAbout` (12 тем ухода за домом), `publishingPrinciples`, `correctionsPolicy`, `actionableFeedbackPolicy`, `ownershipFundingInfo` (раскрытие Amazon), `contactPoint`, `areaServed: United States` |
| `reviewedBy` юриста + «Проверил: …» под H1 | `Article.reviewedBy` → строка «Reviewed by <имя>, <роль> · дата» в байлайне и `WebPage.reviewedBy` / `lastReviewed` в разметке |
| `citation` как `Legislation` | источники-стандарты (EPA, CPSC…) публикуются как `GovernmentOrganization` |
| `softwareApplicationSchema` + `webPageSchema(aboutId)` | инструменты: `WebPage` → `mainEntity` = `WebApplication` |
| — | страницы поверхностей: `HowTo` из видимых шагов глубокой чистки + `ItemList` безопасных товаров |
| — | обзоры товаров: таблица характеристик как `additionalProperty`, `category` |
| — | статьи: `about` (комната, поверхности), `abstract` (= quick answer), `isAccessibleForFree`, `alternativeHeadline`, картинки шагов в `HowTo` |
| IndexNow по diff состояния | `npm run indexnow` отправляет только новые/изменённые/удалённые URL (по `lastmod`), `--dry-run`, `--all`; состояние в `.data/indexnow-state.json` |

Правило из traffic.law сохраняется: разметка строится из тех же данных, что видны на странице.

## 3. Что может сделать только команда

1. **Подпись эксперта на статьях.** Нужен реальный человек (профессиональный клинер, специалист IICRC,
   химик) со страницей автора. Добавить его в `AUTHORS` и в статью:
   `reviewedBy: { authorSlug: '<slug>', reviewedAt: '2026-11-05' }`. Подписывать только то, что он прочитал.
2. **Профили бренда → `SITE.sameAs`:** Instagram (уже ведётся), Pinterest (ключевой канал для home care),
   YouTube, Facebook, TikTok. Это связывает бренд в Knowledge Graph.
3. **Google Search Console и Bing Webmaster Tools:** подтвердить сайт, отправить `/sitemap.xml`.
   Bing питает Copilot и ChatGPT Search — для AI-выдачи он важнее, чем кажется.
4. **Ссылки:** гостевые советы в медиа о доме, ответы на Reddit/Quora со ссылкой на конкретный гайд,
   Pinterest-пины на каждую статью.

## 4. Контент-план — главный рычаг роста

Формула traffic.law: `много страниц × точный ответ на запрос × доверие × техника × свежесть`. У нас
техника и доверие готовы, страниц — 188. Цель — 100–150 страниц, один интент = одна страница.

| Кластер | Шаблон запроса | Примеры |
|---|---|---|
| Пятно × поверхность | how to remove {stain} from {surface} | red wine from carpet, blood from mattress, grease from hardwood, ink from leather couch |
| Поверхность × задача | how to clean {surface} | quartz countertops, stainless steel fridge, granite, glass shower door, oven racks |
| Запах | how to get rid of {smell} in {place} | pet urine smell in carpet, musty smell in closet, washing machine smell |
| Безопасность химии | can you mix / is {product} safe on {surface} | vinegar on granite, bleach and vinegar, magic eraser on car |
| Best-of | best {tool} for {use} | best vacuum for pet hair, best mop for vinyl plank, best shower cleaner |
| Сравнения | {A} vs {B} | Bissell vs Hoover carpet cleaner, steam mop vs spin mop |

Сезонный «радар» (аналог Legal Radar): весна — генеральная уборка, лето — плесень и грили,
осень — подготовка к праздникам, зима — соль на полу и сухость дерева, плюс отзывы товаров (CPSC recalls).
Публиковать за 4–6 недель до пика сезона.

## 5. Цикл улучшений

| Частота | Действие |
|---|---|
| После деплоя | `npm run indexnow` |
| Еженедельно | GSC: запросы с позицией 8–20 → дописать страницу под них |
| Ежемесячно | CTR < 2% при позиции ≤ 5 → переписать title/description |
| Ежеквартально | Перепроверка источников, `updatedAt` — только при реальных изменениях |
