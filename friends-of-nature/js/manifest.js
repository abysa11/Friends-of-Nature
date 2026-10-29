/* Список ВСЕХ картинок сайта. Это единственный источник правды:
 *  - по нему сайт ищет файлы: ключ "trash/bottle" -> assets/img/trash-bottle.png (или .jpg, .webp)
 *  - по нему страница assets.html показывает, чего не хватает, и даёт промпты.
 * Пока файла нет, сайт показывает цветную заглушку с подписью, и всё работает.
 */
window.FON = window.FON || {};

FON.STYLE = {
  item: "Polished 2D children's picture-book illustration in hand-painted gouache and coloured pencil, subtle paper grain, soft organic edges and natural detail, fresh greens, sage, warm off-white and restrained sunny yellow, friendly and calm, appealing to children and adults without looking babyish, one clearly recognizable subject centered with generous empty margin, clean warm-white background, no text, no letters, no vector art, no geometric flat shapes, no watermark, square 1:1 format",
  scene: "Polished 2D children's picture-book illustration in hand-painted gouache and coloured pencil, subtle paper grain, soft organic edges and natural detail, fresh greens, sage and warm cream, friendly and calm, appealing to children and adults without looking babyish, no text, no letters, no vector art, no geometric flat shapes, no watermark"
};

/* ключ -> другой ключ (одна и та же картинка используется в разных играх) */
FON.ALIAS = { "nature/bee": "bee/bee" };

/* kind: item = один предмет на белом фоне (1:1); scene = целая сцена на всю картинку.
 * prio: 1 = нужно для самой игры, 2 = красота меню. */
FON.MANIFEST = [
  { id: "forest", title: ["Лес: 4 этапа роста", "Forest: 4 growth stages"], kind: "scene", ratio: "16:9", prio: 1,
    note: ["Во всех четырёх картинках держи один и тот же ракурс и линию горизонта, тогда лес будет красиво «вырастать» при смене этапа.", "Keep the same camera angle and horizon in all four images so they crossfade nicely."],
    items: [
      ["forest/phase1", "Этап 1: саженцы", "Stage 1: saplings", "side view of a small empty meadow with a few tiny green saplings just sprouting from the soil, two small flowers, a bright early morning sky, lots of empty space, horizon line at 60% height"],
      ["forest/phase2", "Этап 2: молодая роща", "Stage 2: young grove", "side view of the same meadow now with about a dozen small and medium young trees, small bushes and wildflowers, a butterfly, sunny blue sky, horizon line at 60% height"],
      ["forest/phase3", "Этап 3: зелёный лес", "Stage 3: green forest", "side view of the same place as a lush green forest with many tall round and pine trees, a small stream, flowers and bushes, a deer and a squirrel visible, warm afternoon light, horizon line at 60% height"],
      ["forest/phase4", "Этап 4: живой лес", "Stage 4: living forest", "side view of the same place as a thriving living forest full of tall trees and colourful flowers, a river with a small waterfall, birds in the sky, a deer, a fox, rabbits, bees and butterflies, a rainbow, golden sunlight, very rich, happy and full of life, horizon line at 60% height"]
    ] },

  { id: "groups", title: ["Обложки трёх групп игр", "Covers of the three game groups"], kind: "scene", ratio: "4:3", prio: 2,
    items: [
      ["group/waste", "Группа: Отходы и ресурсы", "Group: Waste & Resources", "colourful sorting bins, a big water drop, a wind turbine and solar panels together in a sunny scene"],
      ["group/wild", "Группа: Дикая природа", "Group: Wildlife", "a deer, a fox and a bee together in a sunny green forest"],
      ["group/planet", "Группа: Планета и города", "Group: Planet & Cities", "a happy green planet Earth with a small green city, trees and blue ocean"]
    ] },

  { id: "games", title: ["Картинки-превью 15 игр (для выбора игры на доске)", "Thumbnails of the 15 games"], kind: "scene", ratio: "4:3", prio: 2,
    items: [
      ["game/trash", "Trash Rush", "Trash Rush", "a conveyor belt carrying a bottle, a banana peel and a newspaper towards four coloured sorting bins"],
      ["game/ocean", "Clean the Ocean", "Clean the Ocean", "a small cheerful boat collecting floating plastic bottles from a clean blue ocean"],
      ["game/zerowaste", "Zero Waste", "Zero Waste", "a cosy house with recycling bins, a compost bin and a box of clothes to donate"],
      ["game/water", "Water Crisis", "Water Crisis", "a village with houses, a farm field and a factory sharing water from one big blue water drop"],
      ["game/power", "Power Grid", "Power Grid", "a city powered by solar panels, wind turbines and a hydro dam"],
      ["game/forest", "Forest Guardian", "Forest Guardian", "a forest ranger planting a tree while a small fire is put out and animals watch"],
      ["game/rescue", "Wildlife Rescue", "Wildlife Rescue", "a friendly rescuer with a blanket helping a baby hedgehog"],
      ["game/firewatch", "Firewatch", "Firewatch", "a fire watchtower in a forest with a red fire truck and a plume of smoke"],
      ["game/bee", "Bee Empire", "Bee Empire", "a cute bee flying over a beehive and a field of colourful flowers"],
      ["game/survival", "Survival: Wild", "Survival: Wild", "a fox cub in a meadow with berry bushes, a pond and a den"],
      ["game/city", "Eco City", "Eco City", "a green eco city with parks, solar roofs and tree-lined streets"],
      ["game/puzzle", "Ecosystem Puzzle", "Ecosystem Puzzle", "puzzle pieces joined into a circle showing a sun, grass, a frog and a hawk with arrows between them"],
      ["game/explorer", "Nature Explorer", "Nature Explorer", "a young explorer with a camera and a notebook in a mountain valley, a snow leopard far away"],
      ["game/planet", "Restore the Planet", "Restore the Planet", "planet Earth being healed, split into four regions: forest, ocean, desert and mountains"],
      ["game/evolution", "Eco Evolution", "Eco Evolution", "a tiny pond ecosystem growing, from algae to a fish to a heron, arranged in a circle"]
    ] },

  { id: "trash", title: ["Trash Rush: контейнеры и мусор", "Trash Rush: bins and waste"], kind: "item", ratio: "1:1", prio: 1,
    usedIn: ["Trash Rush", "Zero Waste"],
    items: [
      ["bin/plastic", "Контейнер для пластика (синий)", "Plastic bin (blue)", "a blue recycling bin for plastic with a small plastic bottle symbol on it"],
      ["bin/paper", "Контейнер для бумаги (жёлтый)", "Paper bin (yellow)", "a yellow recycling bin for paper with a small paper sheet symbol on it"],
      ["bin/glass", "Контейнер для стекла (зелёный)", "Glass bin (green)", "a green recycling bin for glass with a small glass bottle symbol on it"],
      ["bin/organic", "Контейнер для органики (коричневый)", "Organic bin (brown)", "a brown bin for food waste with a small apple core symbol on it"],
      ["trash/bottle", "Пластиковая бутылка", "Plastic bottle", "a plastic water bottle with a blue cap"],
      ["trash/bag", "Полиэтиленовый пакет", "Plastic bag", "a crumpled plastic shopping bag"],
      ["trash/cup", "Пластиковый стаканчик", "Plastic cup", "a disposable plastic cup"],
      ["trash/newspaper", "Газета", "Newspaper", "a folded newspaper (no readable text, just grey lines)"],
      ["trash/box", "Картонная коробка", "Cardboard box", "a flattened brown cardboard box"],
      ["trash/notebook", "Тетрадь", "Notebook", "a school notebook with a spiral binding"],
      ["trash/jar", "Стеклянная банка", "Glass jar", "an empty glass jam jar with a lid"],
      ["trash/wine", "Стеклянная бутылка", "Glass bottle", "a green glass bottle"],
      ["trash/perfume", "Стеклянный флакон", "Glass vial", "a small glass perfume bottle"],
      ["trash/peel", "Банановая кожура", "Banana peel", "a banana peel"],
      ["trash/core", "Яблочный огрызок", "Apple core", "a bitten apple core"],
      ["trash/eggshell", "Яичная скорлупа", "Eggshell", "broken eggshell halves"],
      ["trash/toy", "Редкий: пластиковая уточка", "Rare: plastic duck", "an old yellow plastic rubber duck toy"],
      ["trash/comic", "Редкий: детская книжка", "Rare: picture book", "a colourful children's picture book (no text)"],
      ["trash/vase", "Редкий: стеклянная ваза", "Rare: glass vase", "a pretty glass vase"],
      ["trash/fruit", "Редкий: ананас", "Rare: pineapple", "a ripe pineapple"]
    ] },

  { id: "ocean", title: ["Clean the Ocean", "Clean the Ocean"], kind: "item", ratio: "1:1", prio: 1,
    items: [
      ["ocean/bottle", "Бутылка в воде", "Floating bottle", "a floating plastic bottle"],
      ["ocean/bag", "Пакет в воде", "Floating bag", "a floating plastic bag"],
      ["ocean/net", "Рыболовная сеть", "Fishing net", "a tangled fishing net"],
      ["ocean/barrel", "Бочка", "Barrel", "a rusty red barrel"],
      ["ocean/ship", "Кораблик", "Boat", "a small cheerful yellow cleaning boat with a little crane, side view, facing right"],
      ["ocean/port", "Порт", "Port", "a small wooden harbour dock with a little lighthouse, side view"]
    ] },

  { id: "zerowaste", title: ["Zero Waste: комнаты, вещи, действия", "Zero Waste: rooms, things, actions"], kind: "item", ratio: "1:1", prio: 1,
    note: ["Также в этой игре используются картинки из раздела Trash Rush (банановая кожура, банка, бутылка, газета, коробка).", "This game also reuses images from Trash Rush (peel, jar, bottle, newspaper, box)."],
    items: [
      ["room/kitchen", "Комната: кухня", "Room: kitchen", "a small cartoon kitchen with a stove and a fridge"],
      ["room/bathroom", "Комната: ванная", "Room: bathroom", "a small cartoon bathroom with a bathtub and a sink"],
      ["room/bedroom", "Комната: спальня", "Room: bedroom", "a small cartoon bedroom with a bed and a wardrobe"],
      ["room/garage", "Комната: гараж", "Room: garage", "a small cartoon garage with tools on the wall"],
      ["act/recycle", "Действие: переработать", "Action: recycle", "the green three-arrow recycling symbol"],
      ["act/reuse", "Действие: использовать снова", "Action: reuse", "a glass jar with a small plant growing in it"],
      ["act/compost", "Действие: в компост", "Action: compost", "a wooden compost bin with a green leaf"],
      ["act/donate", "Действие: отдать", "Action: donate", "a cardboard box with clothes and a heart on it"],
      ["act/landfill", "Действие: в мусор", "Action: landfill", "a plain grey garbage can"],
      ["zw/pizza", "Жирная коробка от пиццы", "Greasy pizza box", "a greasy pizza box with stains"],
      ["zw/shampoo", "Пустой флакон шампуня", "Empty shampoo bottle", "an empty shampoo bottle"],
      ["zw/toothbrush", "Старая зубная щётка", "Old toothbrush", "an old worn toothbrush"],
      ["zw/towel", "Хорошее полотенце", "Good towel", "a clean fluffy blue towel"],
      ["zw/rag", "Рваное полотенце", "Torn towel", "a torn grey rag towel"],
      ["zw/jacket", "Тёплая куртка", "Warm jacket", "a warm winter jacket"],
      ["zw/socks", "Рваные носки", "Torn socks", "a pair of socks with a hole"],
      ["zw/tissue", "Использованная салфетка", "Used tissue", "a used crumpled tissue"],
      ["zw/scrap", "Металлолом", "Scrap metal", "a pile of scrap metal pipes"],
      ["zw/clippings", "Скошенная трава", "Grass clippings", "a pile of cut grass clippings"],
      ["zw/bike", "Старый велосипед", "Old bicycle", "a small old children's bicycle that still works"]
    ] },

  { id: "water", title: ["Water Crisis", "Water Crisis"], kind: "item", ratio: "1:1", prio: 1,
    items: [
      ["water/home", "Дома", "Homes", "a few small cosy houses"],
      ["water/farm", "Фермы", "Farms", "a farm field with a red barn and green crops"],
      ["water/factory", "Предприятия", "Industry", "a factory with two chimneys"],
      ["water/hospital", "Больница", "Hospital", "a hospital building with a red cross sign"]
    ] },

  { id: "power", title: ["Power Grid", "Power Grid"], kind: "item", ratio: "1:1", prio: 1,
    items: [
      ["power/solar", "Солнечная панель", "Solar panel", "a solar panel on a stand"],
      ["power/wind", "Ветряк", "Wind turbine", "a white wind turbine"],
      ["power/hydro", "ГЭС", "Hydro plant", "a small hydroelectric dam with a waterfall"],
      ["power/gas", "Газовая станция", "Gas plant", "a power plant with a chimney and grey smoke"],
      ["power/battery", "Батарея", "Battery", "a big green battery with a lightning bolt"]
    ] },

  { id: "forest", title: ["Forest Guardian и Firewatch", "Forest Guardian and Firewatch"], kind: "item", ratio: "1:1", prio: 1,
    usedIn: ["Forest Guardian", "Firewatch", "Survival: Wild"],
    items: [
      ["forest/tree", "Дерево", "Tree", "a green tree with a round crown"],
      ["forest/sapling", "Саженец", "Sapling", "a tiny sapling growing in a small mound of soil"],
      ["forest/fire", "Огонь", "Fire", "a big orange and red flame"],
      ["forest/burnt", "Сгоревшее дерево", "Burnt tree", "a burnt black tree stump with a wisp of smoke"],
      ["forest/bucket", "Ведро воды", "Water bucket", "a blue bucket full of water"],
      ["forest/shield", "Щит", "Shield", "a green shield with a white leaf on it"],
      ["fw/house", "Домик в деревне", "Village house", "a small village house with a red roof"],
      ["fw/hill", "Холм", "Hill", "a rocky brown hill"],
      ["fw/truck", "Пожарная команда", "Fire crew", "a red fire truck"]
    ] },

  { id: "help", title: ["Wildlife Rescue: как помочь животному", "Wildlife Rescue: ways to help"], kind: "item", ratio: "1:1", prio: 1,
    note: ["Рядом с животным в игре выбирают одну из четырёх картинок-способов помощи. Неправильные способы рисуй мягко, без страшного: игра сама покажет, что выбор не подошёл.", "The child picks one of four pictures. Draw wrong options gently, not scary."],
    items: [
      ["help/vet", "Позвать спасателя или ветеринара", "Call a rescuer or vet", "a friendly vet with a first-aid bag holding a phone"],
      ["help/nest", "Вернуть в гнездо", "Put back in the nest", "a hand gently putting a small bird back into a nest in a tree"],
      ["help/box", "Тёплая коробка и вода", "Warm box and water", "a cardboard box with a soft blanket and a bowl of water"],
      ["help/carry", "Перенести через дорогу", "Carry across the road", "hands carefully carrying a turtle across a small road"],
      ["help/leave", "Не трогать, наблюдать издалека", "Leave it, watch from afar", "a person standing far away quietly watching a baby rabbit in the grass"],
      ["help/window", "Открыть окно", "Open the window", "an open window with a bat flying out into the night"],
      ["help/home", "Неправильно: унести домой", "Wrong: take it home", "a person carrying a wild animal into a house"],
      ["help/feed", "Неправильно: кормить молоком и шоколадом", "Wrong: feed milk and chocolate", "a hand offering a glass of milk and a chocolate bar to a small animal"],
      ["help/shout", "Неправильно: кричать и гнать", "Wrong: shout and chase", "a person shouting and waving a broom at an animal"],
      ["help/pull", "Неправильно: дёргать", "Wrong: pull hard", "a hand pulling an animal by its paw"]
    ] },

  { id: "bee", title: ["Bee Empire и Survival", "Bee Empire and Survival"], kind: "item", ratio: "1:1", prio: 1,
    items: [
      ["bee/sprout", "Росток", "Sprout", "a small green sprout with two leaves"],
      ["bee/flower", "Цветок", "Flower", "a big bright pink flower with a yellow centre"],
      ["bee/bee", "Пчела", "Bee", "a cute friendly bee"],
      ["bee/hive", "Улей", "Beehive", "a golden beehive"],
      ["bee/honey", "Мёд", "Honey", "a jar of honey with a wooden dipper"],
      ["surv/berries", "Ягоды", "Berries", "a small bush with red berries"],
      ["surv/den", "Нора", "Den", "a cosy burrow entrance in a grassy hill"],
      ["surv/rock", "Камень", "Rock", "a grey rock"]
    ] },

  { id: "city", title: ["Eco City", "Eco City"], kind: "item", ratio: "1:1", prio: 1,
    items: [
      ["city/house", "Жильё", "Housing", "an apartment building with small windows"],
      ["city/factory", "Завод", "Factory", "a factory with chimneys and grey smoke"],
      ["city/park", "Парк", "Park", "a small park with a bench, a pond and trees"],
      ["city/solar", "Солнечная станция", "Solar plant", "a solar power plant with several panels"],
      ["city/recycle", "Центр переработки", "Recycling hub", "a recycling centre building with a green recycling symbol"],
      ["city/trees", "Лесопосадка", "Tree belt", "a row of several green trees"]
    ] },

  { id: "nature", title: ["Живая природа: герои для 6 игр", "Nature cast: characters for 6 games"], kind: "item", ratio: "1:1", prio: 1,
    usedIn: ["Ecosystem Puzzle", "Eco Evolution", "Nature Explorer", "Wildlife Rescue", "Survival: Wild", "Forest Guardian"],
    note: ["Это общие герои. Один раз нарисуешь, и они работают сразу в нескольких играх. Пчела берётся из раздела «Bee Empire».", "Shared characters used across several games. The bee comes from the Bee Empire section."],
    items: [
      ["nature/sun", "Солнце", "Sun", "a happy smiling sun"],
      ["nature/grass", "Трава", "Grass", "a tuft of green grass"],
      ["nature/moss", "Мох", "Moss", "a clump of green moss on a small stone"],
      ["nature/wildflowers", "Полевые цветы", "Wildflowers", "a small bunch of wildflowers"],
      ["nature/cactus", "Кактус", "Cactus", "a blooming green cactus in sand"],
      ["nature/oak", "Дуб", "Oak", "a big oak tree with a thick trunk"],
      ["nature/soil", "Почва", "Soil", "a cross-section of dark soil with roots and a worm"],
      ["nature/fungi", "Грибы", "Fungi", "a group of mushrooms with red and brown caps"],
      ["nature/algae", "Водоросли", "Algae", "green algae strands in water"],
      ["nature/phytoplankton", "Фитопланктон", "Phytoplankton", "tiny green microscopic phytoplankton cells, cute"],
      ["nature/waterflea", "Дафния", "Water flea", "a tiny cute water flea (daphnia)"],
      ["nature/krill", "Криль", "Krill", "a small pink krill shrimp"],
      ["nature/bacteria", "Бактерии", "Bacteria", "cute friendly microbes (bacteria)"],
      ["nature/caterpillar", "Гусеница", "Caterpillar", "a green caterpillar on a leaf"],
      ["nature/grasshopper", "Кузнечик", "Grasshopper", "a green grasshopper"],
      ["nature/butterfly", "Бабочка-монарх", "Monarch butterfly", "an orange monarch butterfly"],
      ["nature/frog", "Лягушка", "Frog", "a friendly green frog"],
      ["nature/snake", "Уж", "Grass snake", "a green grass snake, friendly"],
      ["nature/roach", "Плотва", "Roach", "a silver roach fish"],
      ["nature/pike", "Щука", "Pike", "a long green pike fish"],
      ["nature/sardine", "Сардина", "Sardine", "a small silver sardine fish"],
      ["nature/tuna", "Тунец", "Tuna", "a blue tuna fish"],
      ["nature/shark", "Акула", "Shark", "a friendly grey shark"],
      ["nature/whale", "Кит", "Whale", "a blue whale"],
      ["nature/heron", "Цапля", "Heron", "a grey heron standing on one leg"],
      ["nature/kingfisher", "Зимородок", "Kingfisher", "a bright blue kingfisher bird on a branch"],
      ["nature/songbird", "Певчая птица", "Songbird", "a small songbird"],
      ["nature/hawk", "Ястреб", "Hawk", "a hawk with spread wings"],
      ["nature/owl", "Сова", "Owl", "a cute owl"],
      ["nature/seagull", "Чайка", "Seagull", "a white seagull"],
      ["nature/rabbit", "Кролик", "Rabbit", "a cute grey rabbit"],
      ["nature/squirrel", "Белка", "Squirrel", "a red squirrel with a fluffy tail"],
      ["nature/hedgehog", "Ёж", "Hedgehog", "a cute hedgehog"],
      ["nature/turtle", "Черепаха", "Turtle", "a friendly turtle"],
      ["nature/bat", "Летучая мышь", "Bat", "a cute bat hanging upside down"],
      ["nature/fox", "Лиса", "Fox", "a red fox"],
      ["nature/fennec", "Фенёк", "Fennec fox", "a fennec fox with big ears"],
      ["nature/wolf", "Волк", "Wolf", "a grey wolf, friendly, not scary"],
      ["nature/deer", "Олень", "Deer", "a deer with antlers"],
      ["nature/goat", "Горный козёл", "Mountain goat", "a white mountain goat with curved horns"],
      ["nature/lynx", "Рысь", "Lynx", "a lynx with tufted ears"],
      ["nature/leopard", "Снежный барс", "Snow leopard", "a snow leopard with a long tail"]
    ] },

  { id: "planet", title: ["Restore the Planet", "Restore the Planet"], kind: "scene", ratio: "1:1", prio: 2,
    items: [
      ["planet/forest", "Регион: леса", "Region: forests", "a landscape of green forested hills"],
      ["planet/ocean", "Регион: океаны", "Region: oceans", "a landscape of blue ocean with waves and a coral reef"],
      ["planet/desert", "Регион: пустыни", "Region: deserts", "a landscape of sandy desert dunes with a few cacti"],
      ["planet/mountain", "Регион: горы", "Region: mountains", "a landscape of snowy mountains with a glacier"],
      ["planet/clean", "Действие: убрать мусор", "Action: clean up", "a pair of hands holding a full bag of collected litter and a broom"]
    ] }
];

/* Все ключи одним списком + удобные функции */
FON.allKeys = () => FON.MANIFEST.flatMap(s => s.items.map(i => i[0]));
FON.entry = key => { for (const s of FON.MANIFEST) for (const i of s.items) if (i[0] === key) return { sec: s, item: i }; return null; };
FON.promptFor = (sec, item) => FON.STYLE[sec.kind] + ". Subject: " + item[3] + "." + (sec.kind === "scene" ? " Aspect ratio " + sec.ratio + "." : "");
FON.fileName = key => key.replace(/\//g, "-");
