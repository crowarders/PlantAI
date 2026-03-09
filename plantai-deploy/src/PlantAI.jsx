import { useState, useRef, useEffect } from "react";

const DB = {
  wheat:{name:"Буудай",icon:"🌾",diseases:[
    {name:"Гельминтоспориоз",pathogen:"Helminthosporium sativum",type:"fungal",symptoms:"Үндэс илжирч навчин дээр толбо. Ишний угт хүрэн зурвас.",treatment:"Үр цэвэрлэх, сэлгэх тариалалт, фунгицид (тебуконазол)",severity:"high"},
    {name:"Фузариоз",pathogen:"Fusarium spp.",type:"fungal",symptoms:"Соёог гэмтээж үхүүлнэ. Ишний уг хүрэнтнэ. Чийглэг үед ягаавтар өнгөр.",treatment:"Тэсвэртэй сорт, үрийн ариутгал, сэлгэх тариалалт",severity:"high"},
    {name:"Навчин зэв",pathogen:"Puccinia triticina",type:"fungal",symptoms:"Навчны дээд хэсэгт зэвэн хүрэн зууван төвгөр 1-2мм. Навч хуйлран хатна.",treatment:"Тэсвэртэй сорт, фунгицид (пропиконазол)",severity:"medium"},
    {name:"Септориоз",pathogen:"Septoria tritici",type:"fungal",symptoms:"Навч, иш, түрүүнд цайвар шар хүрэн толбонууд. Толбоны төвд хар пикнидүүд.",treatment:"Сэлгэх тариалалт, фунгицид, тэсвэртэй сорт",severity:"medium"},
    {name:"Тоост харуу",pathogen:"Ustilago tritici",type:"fungal",symptoms:"Түрүү бүхэлдээ хар тоосорхог спор болж зөвхөн гол иш үлдэнэ.",treatment:"Системийн фунгицидээр үрийг боловсруулах",severity:"high"},
    {name:"Хатуу харуу",pathogen:"Tilletia tritici",type:"fungal",symptoms:"Өвчтэй түрүү 5-10 см богино, хайрс дэрдийсэн, цэнхэр туяатай тод хар ногоон.",treatment:"Үрийн ариутгал, тэсвэртэй сорт",severity:"high"},
    {name:"Ишний зэв",pathogen:"Puccinia graminis",type:"fungal",symptoms:"Иш, навчны углуурга дээр том хүрэн/хар төвгөр.",treatment:"Тэсвэртэй сорт, фунгицид",severity:"high"},
    {name:"Шар зэв",pathogen:"Puccinia glumarum",type:"fungal",symptoms:"Навчин дээр эгнээгээр байрласан жижиг шар төвгөрүүд.",treatment:"Тэсвэртэй сорт, эрт илрүүлэх",severity:"medium"},
  ]},
  barley:{name:"Арвай",icon:"🌿",diseases:[
    {name:"Чулуут харуу",pathogen:"Ustilago hordei",type:"fungal",symptoms:"Түрүү нилэнхүйдээ хатуу хар өнгөтэй болж хувирна.",treatment:"Үрийн ариутгал, тэсвэртэй сорт",severity:"high"},
    {name:"Тоост харуу",pathogen:"Ustilago nuda",type:"fungal",symptoms:"Түрүү бүхэлдээ хар тоосорхог спор болж зөвхөн гол иш үлдэнэ.",treatment:"Системийн фунгицидээр үрийг боловсруулах",severity:"high"},
    {name:"Давжаа зэв",pathogen:"Puccinia hordei",type:"fungal",symptoms:"Навчин дээр жижигхэн шар өнгөтэй төвгөрүүд.",treatment:"Тэсвэртэй сорт, фунгицид",severity:"medium"},
  ]},
  potato:{name:"Төмс",icon:"🥔",diseases:[
    {name:"Фитофтор",pathogen:"Phytophthora infestans",type:"fungal",symptoms:"Навчны захаар хар хүрэн толбо. Доод талд цагаан өнгөр. Булцуунд хонхойсон хүрэн толбо.",treatment:"Фунгицид (манкозеб, металаксил), тэсвэртэй сорт",severity:"critical"},
    {name:"Альтернариоз",pathogen:"Alternaria solani",type:"fungal",symptoms:"Навчин дээр цагирган хүрээтэй бараан-хүрэн толбо.",treatment:"Фунгицид, сэлгэх тариалалт, тэжээлийн бодис хангах",severity:"medium"},
    {name:"Хуурай илжрэл",pathogen:"Fusarium spp.",type:"fungal",symptoms:"Хадгалалтанд бор-саарал толбо. Булцуу хатааран хөнгөн болно.",treatment:"Хадгалалтын нөхцөл сайжруулах, гэмтэлгүй булцуу хадгалах",severity:"medium"},
    {name:"Хар цахлай",pathogen:"Rhizoctonia solani",type:"fungal",symptoms:"Булцуун дээр хар склероци. Соёог торлон бүрхэж хүрэн толбо.",treatment:"Эрүүл үрийн материал, хөрс боловсруулах",severity:"medium"},
    {name:"Энгийн цахлай",pathogen:"Streptomyces scabies",type:"bacterial",symptoms:"Булцуунд товгор, хонхорхой, шарх. Хуурай халуун жилд ихэснэ.",treatment:"Хөрсний pH бууруулах, сэлгэх тариалалт, усалгаа нэмэх",severity:"low"},
    {name:"Цагирган илжрэл",pathogen:"Corynebacterium sepedonicum",type:"bacterial",symptoms:"Иш огтлоход судал хүрэнтэн цагираг. Булцуу зүсэхэд шаравтар салст.",treatment:"Эрүүл үрийн материал, багаж ариутгах",severity:"critical"},
    {name:"Хар хөл",pathogen:"Pectobacterium phytophthorium",type:"bacterial",symptoms:"Үндэсний хүзүүвч харлан ялзарна. Навч мушгирч гандан шарлана.",treatment:"Эрүүл үрийн материал, хуурай нөхцөлд хадгалах",severity:"high"},
    {name:"Навч хуйлрах (PLRV)",pathogen:"PLRV вирус",type:"viral",symptoms:"Доод навчнаас цайрч гол судлаараа хуйлрана. Навч хатуу хэврэг.",treatment:"Эрүүл үрийн материал, бөөстэй тэмцэх",severity:"high"},
    {name:"PVY вирус",pathogen:"PVY вирус",type:"viral",symptoms:"Навч үрчлээтэн цоохортох, хумийж гадаргуу үрчийнэ. Ургац 40% буурна.",treatment:"Бөөстэй тэмцэх, эрүүл үрийн материал",severity:"high"},
  ]},
  cabbage:{name:"Байцаа",icon:"🥬",diseases:[
    {name:"Хар хөл",pathogen:"Olpidium brassicae",type:"fungal",symptoms:"Үрслэгийн иш нарийсан харлаж тахийна. Ургамал үхнэ.",treatment:"Хөрс сэлгэх, шигүү тарихгүй, усалгааг зохицуулах",severity:"high"},
    {name:"Гүвдрүү",pathogen:"Plasmodiophora brassicae",type:"fungal",symptoms:"Навч цайвар ногоон шар. Үндэс дээр ур гүвдрүү.",treatment:"Шохойлох (pH 7.2+), 7 жилийн сэлгэх тариалалт",severity:"critical"},
    {name:"Саарал илжрэл",pathogen:"Botrytis cinerea",type:"fungal",symptoms:"Хадгалалтын үед навч нялцайн ялзарч саарал хөгцөөр хучигдана.",treatment:"2-3 хамгаалалтын навчтай хадгалах, агуулахыг гэрэлтүүлэх",severity:"medium"},
    {name:"Судлын бактериоз",pathogen:"Xanthomonas campestris",type:"bacterial",symptoms:"Навчны захаас шарлаж хатна. Судлууд харласан.",treatment:"Эрүүл үрийн материал, дулаан усаар үрийг боловсруулах",severity:"high"},
    {name:"Салслаг бактериоз",pathogen:"Erwinia carotovora",type:"bacterial",symptoms:"Навчинд бор усархаг толбууд. Толгой дотроосоо илжирнэ.",treatment:"Хортонтой тэмцэх, механик гэмтлээс хамгаалах",severity:"high"},
  ]},
  onion:{name:"Сонгино",icon:"🧅",diseases:[
    {name:"Зэв",pathogen:"Puccinia porri",type:"fungal",symptoms:"Цоорон дээр цайвар шаргал зууван толбо.",treatment:"Фунгицид, сэлгэх тариалалт",severity:"medium"},
    {name:"Хуурмаг гуалах",pathogen:"Peronospora destructor",type:"fungal",symptoms:"Ургамлын өнгө хувирч цоор шарлан унана. Чийгтэй үед саарал өнгөр.",treatment:"Фунгицид (ридомил), сэлгэх тариалалт",severity:"high"},
    {name:"Харуу",pathogen:"Urocystis cepulae",type:"fungal",symptoms:"Цоорон дээр саарал/харавтар зурвас хэлбэрийн хөөсөн толбо.",treatment:"Эрүүл үрийн материал, хөрс ариутгах",severity:"high"},
    {name:"Хүзүүвчийн илжрэл",pathogen:"Botrytis allii",type:"fungal",symptoms:"Хүзүүвчээсээ саарал хөвсгөр хөгц. Эд зөөлөрч шаравтар шүүс.",treatment:"Хадгалалтын чийг дулааны горимыг сахих",severity:"medium"},
    {name:"Бактерийн нойтон илжрэл",pathogen:"Erwinia carotovora",type:"bacterial",symptoms:"Махлаг эдүүд зөөлөрч өмхий үнэртэй.",treatment:"Хуурай сэрүүн нөхцөлд хадгалах",severity:"high"},
  ]},
  garlic:{name:"Сармис",icon:"🧄",diseases:[
    {name:"Ногоон хөгц",pathogen:"Penicillium glaucum",type:"fungal",symptoms:"Хумсны гадаргууд хөх ногоон сэвсгэр хөгцөөр бүрхэгдэнэ.",treatment:"Хуурай сэрүүн нөхцөлд хадгалах",severity:"medium"},
  ]},
  carrot:{name:"Лууван",icon:"🥕",diseases:[
    {name:"Фомоз",pathogen:"Phoma rostrupii",type:"fungal",symptoms:"Ишний доод хэсэгт бараан зурвас, хөх ягаан толбо.",treatment:"Сэлгэх тариалалт, ургамлын үлдэгдлийг устгах",severity:"medium"},
    {name:"Цагаан ялзрал",pathogen:"Sclerotinia sclerotiorum",type:"fungal",symptoms:"Лууван зөөлөрч цагаан хөгц тогтоно. Хар склероци.",treatment:"Гэмтэлгүй хураах, хадгалалтын температур бууруулах",severity:"medium"},
    {name:"Саарал ялзрал",pathogen:"Botrytis cinerea",type:"fungal",symptoms:"Үзүүрээс бор саарал хөвсгөр өнгөр, хар склероци.",treatment:"Тарих хугацааг зөв сонгох, агуулахыг ариутгах",severity:"medium"},
  ]},
  beet:{name:"Манжин",icon:"🟣",diseases:[
    {name:"Церкоспориоз",pathogen:"Cercospora beticola",type:"fungal",symptoms:"Навчинд жижиг цайвар бор улаан бор хүрээтэй 2-3мм толбо.",treatment:"Тэсвэртэй сорт, фунгицид, ургамлын үлдэгдлийг гүн хучих",severity:"medium"},
    {name:"Шилбэжилт",pathogen:"Олон шалтгаант",type:"complex",symptoms:"Иш харлаж нарийсан хатна. Ургамал үхэх эсвэл ургалт зогсонги.",treatment:"Хугацаандаа тарих, зөв гүнд тарих, чанартай үр хэрэглэх",severity:"medium"},
  ]},
  tomato:{name:"Лооль",icon:"🍅",diseases:[
    {name:"Фитофтор",pathogen:"Phytophthora infestans",type:"fungal",symptoms:"Навчны үзүүр захаас хүрэн хар толбо. Чийгтэй үед цагаан саарал өнгөр.",treatment:"Фунгицид, агааржуулалт сайжруулах, доод навчыг авах",severity:"critical"},
    {name:"Альтернариоз",pathogen:"Alternaria solani",type:"fungal",symptoms:"Навчинд бор хүрэн үелсэн хүрээтэй толбо. Жимсний шилбэ орчимд хар хөгц.",treatment:"Фунгицид, сэлгэх тариалалт, тэсвэртэй сорт",severity:"high"},
    {name:"Септориоз",pathogen:"Septoria lycopersici",type:"fungal",symptoms:"Навчинд хар хүрээтэй 2-3мм цагаан толбо.",treatment:"Ургамлын үлдэгдлийг устгах, фунгицид, агааржуулалт",severity:"medium"},
    {name:"Оройн илжрэл",pathogen:"Кальцын дутагдал",type:"abiotic",symptoms:"Жимсний оройд бараан усархаг толбо.",treatment:"Кальцын бордоо, жигд усалгаа",severity:"medium"},
  ]},
  cucumber:{name:"Хэмх",icon:"🥒",diseases:[
    {name:"Гуалах",pathogen:"Erysiphe communis",type:"fungal",symptoms:"Доод навчнуудад цагаан саарал өнгөр. Навч ишийг бүрхэнэ.",treatment:"Фунгицид (хүхэр), агааржуулалт, тэсвэртэй сорт",severity:"medium"},
    {name:"Аскохитоз",pathogen:"Ascochyta cucumis",type:"fungal",symptoms:"Навчинд том хүрэн бор толбо. Иш ялзарч хагарна.",treatment:"Хүлэмжийн ариутгал, фунгицид, агааржуулалт",severity:"high"},
    {name:"Бактерийн толбожилт",pathogen:"Pseudomonas syringae pv. lachrymans",type:"bacterial",symptoms:"Навчны судлын дагуу өнцөг хэлбэрийн толбууд.",treatment:"Эрүүл үрийн материал, хүлэмжийг агааржуулах",severity:"critical"},
  ]},
  apple:{name:"Алим",icon:"🍎",diseases:[
    {name:"Цахлай",pathogen:"Venturia inaequalis",type:"fungal",symptoms:"Навчинд хар ногоон үсэрхэг дугуй толбо. Жимсэнд ан цав.",treatment:"Фунгицид, намрын навч цэвэрлэх, тэсвэртэй сорт",severity:"critical"},
    {name:"Хүрэн илжрэл",pathogen:"Monilinia fructigena",type:"fungal",symptoms:"Жимсэнд хүрэн толбо хурдацтай томорч бүхэлд нь эзэлнэ.",treatment:"Өвчтэй жимсийг устгах, фунгицид, шавьжтай тэмцэх",severity:"high"},
    {name:"Хлороз",pathogen:"Тэжээлийн дутагдал",type:"abiotic",symptoms:"Навчны өнгө хувирч судлууд ногоон үлдэж хоорондох эд шарлана.",treatment:"Төмөр, марганец, магни бордоо",severity:"low"},
  ]},
  seabuckthorn:{name:"Чацаргана",icon:"🟠",diseases:[
    {name:"Вертицеллиозын сульдаа",pathogen:"Verticillium dahliae",type:"fungal",symptoms:"Навч тургороо алдаж цайна, бүх навч унаж үндэс хатна.",treatment:"Өвчтэй модыг ухаж шатааж устгах",severity:"critical"},
    {name:"Фузариозын сульдаа",pathogen:"Fusarium spp.",type:"fungal",symptoms:"Хамгийн хор хөнөөлтэй. Үндэс хатаж үхнэ.",treatment:"Өвчилсөн хэсгийг шатааж устгах",severity:"critical"},
    {name:"Цахлай",pathogen:"Мөөгөнцөр",type:"fungal",symptoms:"Навч жимсэнд хар хүрэн толбо. Жимс хорчийж хатна.",treatment:"Өвчтэй мөчрийг тайрч устгах, фунгицид",severity:"high"},
  ]},
  currant:{name:"Үхэр нүд",icon:"🫐",diseases:[
    {name:"Гуалих",pathogen:"Sphaerotheca mors uvae",type:"fungal",symptoms:"Навч, мөчир, жимсэнд цагаан хөвсгөр өнгөр.",treatment:"Мөчрийн оройг тайрах, фунгицид, тэсвэртэй сорт",severity:"high"},
    {name:"Антракноз",pathogen:"Pseudopeziza ribis",type:"fungal",symptoms:"Доод навчинд жижиг хүрэн толбо. Навч хатаж эрт унана.",treatment:"Намрын навч устгах, фунгицид",severity:"medium"},
    {name:"Баганан зэв",pathogen:"Cronartium ribicola",type:"fungal",symptoms:"Навчны дээд талд цайвар шар толбо, доод талд шаргал төвгөр.",treatment:"Тэсвэртэй сорт, фунгицид",severity:"medium"},
  ]},
  grape:{name:"Усан үзэм",icon:"🍇",diseases:[
    {name:"Гуалих",pathogen:"Uncinula necator",type:"fungal",symptoms:"Жимсэнд цагаан мицели бүрэн бүрхэнэ.",treatment:"Хүхэрлэг бэлдмэл, фунгицид, агааржуулалт",severity:"critical"},
    {name:"Хуурмаг гуалих",pathogen:"Plasmopara viticola",type:"fungal",symptoms:"Навчинд цайвар шаргал толбо. Навч хугарч унана.",treatment:"Зэс агуулсан бэлдмэл, фунгицид",severity:"high"},
  ]},
  corn:{name:"Эрдэнэшиш",icon:"🌽",diseases:[
    {name:"Цэврүүт харуу",pathogen:"Ustilago maydis",type:"fungal",symptoms:"Навч, иш, боргоцойд ур үүсч дотор спор дүүрнэ.",treatment:"Тэсвэртэй сорт, сэлгэх тариалалт",severity:"high"},
    {name:"Бактерийн сульдаа",pathogen:"Pseudomonas avenae",type:"bacterial",symptoms:"Навчинд ус гүйсэн мэт гэмтэл. Навч мушгирна.",treatment:"Тэсвэртэй сорт, сэлгэх тариалалт",severity:"medium"},
  ]},
  rapeseed:{name:"Рапс",icon:"🌻",diseases:[
    {name:"Хар хөлт өвчин",pathogen:"Leptosphaeria maculans",type:"fungal",symptoms:"Навчинд саарал бөөрөнхий толбо, дотор нь хар пикниди. Ишний суурьт бараан хомхойлт үүсэж ургамал хялрана. Ишний хөндлөн огтлолд хар эдийн гэмтэл. Хүнд үед ургамал унаж ургац алдагдана.",treatment:"Фунгицид: Azoxystrobin, Pyraclostrobin. Үрийн боловсруулалт: Thiram, Carbendazim. Propiconazole 25 EC (0.05%) навчны шүршлэг. Эхний шинж тэмдэг дээр фунгицид хэрэглэх.",severity:"high"},
    {name:"Склеротиниа ишний ялзрал",pathogen:"Sclerotinia sclerotiorum",type:"fungal",symptoms:"Ишинд усархаг толбо үүсч цайвар цагаан болж хатна. Цагаан хөвөнлөг мицели ишийг бүрнэ. Ишний дотор ба гадна талд хар склеротий бий болно. Ургамал гэнэт хялраж үхнэ. Цэцэглэлтийн үеэр халдвар тохиолдно.",treatment:"Фунгицид: Boscalid (Endura) цэцэглэлтийн 20-50% үед. Fluazinam, Iprodione фунгицидүүд. Vertisan (Penthiopyrad) 16-20 fl oz/A. Халдварлагдсан ургамлыг устгах.",severity:"high"},
    {name:"Булчирхайт үндэсний өвчин",pathogen:"Plasmodiophora brassicae",type:"fungal",symptoms:"Үндэс хавагнаж булчирхай хэлбэрийн хавдар үүснэ. Ургамал шарлаж хялрана, ус шимж чадахгүй. Хөрсөнд 20 жил амьдрах спорууд.",treatment:"Шохойлох: хөрсний pH 7.0+ болгох. Кальцийн цианамид. Үрийн боловсруулалт: Azoxystrobin, Fludioxonil. Био хяналт: Didymella macrostoma.",severity:"high"},
    {name:"Альтернари хар толбот өвчин",pathogen:"Alternaria brassicae",type:"fungal",symptoms:"Навчинд бараан саарал бөөрөнхий толбо, дотор нь давхар цагираг. Ишинд ба үр тарианд хар толбо. Буурцагууд хатаж хагарна. Боловсорсон үед хамгийн их халдварлагдана.",treatment:"Mancozeb (Dithane M-45) 0.2% шүршлэг. Trifloxystrobin + Tebuconazole (Nativo). Difenoconazole (Score 25 EC). Iprodione + Carbendazim хослол.",severity:"medium"},
    {name:"Хуурамч хөгц",pathogen:"Hyaloperonospora parasitica",type:"fungal",symptoms:"Навчны доод талд цагаан хөвөнлөг өсөлт. Дээд талд шар толбо. Навч хатаж унана. Чийглэг дулаан нөхцөлд хурдан тархана.",treatment:"Үрийн боловсруулалт: Metalaxyl (Apron 35 SD) 6г/кг үр. Ridomil MZ (0.2%) 45-50 хоногтой үед. Mancozeb (0.2%) 60-65 хоногтой үед. Fosetyl-Al фунгицид.",severity:"medium"},
    {name:"Цагаан зэв",pathogen:"Albugo candida",type:"fungal",symptoms:"Навчны доод талд цагаан цэврүү хэлбэрийн толбо. Дээд талд шар-ногоон толбо. Цэцэглэлтийн эрхтэнд гажуудал (staghead). Ишинд хавагнал.",treatment:"Ridomil MZ (Metalaxyl + Mancozeb) 0.2%. Carbendazim 50% WP + Mancozeb M-45 үрийн боловсруулалт. Propiconazole 25 EC (0.05-0.1%). Зэс агуулсан фунгицид.",severity:"medium"},
    {name:"Жинхэнэ хөгц",pathogen:"Erysiphe cruciferarum",type:"fungal",symptoms:"Навчинд цагаан нунтаг хэлбэрийн мөөгөнцрийн өсөлт. Ишинд ба буурцагт тархана. Хуурай дулаан цагт хурдан тархана. Навч шарлаж эрт хатна. Ургац 10-20% буурна.",treatment:"Хүхэрт бэлдмэлүүд. Propiconazole, Tebuconazole навчны шүршлэг. Difenoconazole (Score). Нунтаг хүхэр (Wettable sulfur) шүршлэг.",severity:"low"},
    {name:"Фузари хялрал",pathogen:"Fusarium oxysporum f.sp. conglutinans",type:"fungal",symptoms:"Ургамлын нэг тал шарлаж хялрана. Ишний хөндлөн огтлолд бор судасны гэмтэл. Навч доороос дээш шарлаж хатна. Хөрс дулаан (>24°C) үед тархана.",treatment:"Carbendazim, Thiophanate-methyl хөрсний фунгицид. Үрийн боловсруулалт: Trichoderma viride + Carbendazim. Био хяналт: Trichoderma harzianum. Pseudomonas fluorescens.",severity:"medium"},
    {name:"Астерын шарлалт",pathogen:"Aster Yellows Phytoplasma",type:"viral",symptoms:"Цэцэг ногоон болж гажуудна. Навч шарлаж жижигрэнэ. Буурцаг гажуудалтай. Ургамлын өсөлт удааширна. Aster leafhopper шавжаар дамждаг.",treatment:"Шууд эмчилгээ байхгүй. Leafhopper-ийн эсрэг инсектицид: Lambda-cyhalothrin, Deltamethrin. Халдварлагдсан ургамлыг шуурхай устгах.",severity:"medium"},
    {name:"Вертицилл судалт өвчин",pathogen:"Verticillium longisporum",type:"fungal",symptoms:"Ишинд нэг эсвэл хоёр талдаа судалт шинж тэмдэг. Навч шарлаж нэг талдаа хялрана. Ишний хөндлөн огтлолд бараан судасны гэмтэл. Ургамал эрт боловсорч ургац буурна.",treatment:"Бүртгэлтэй фунгицид байхгүй. Био хяналт судлагдаж байна. Халдварлагдсан ургамлыг устгаж шатаах.",severity:"medium"},
  ]},
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap');
:root{--bg:#060d06;--bg2:#0c160c;--bg3:#142014;--card:rgba(12,22,12,.85);--border:#1a2e1a;--border2:#254025;--g:#4ade80;--g2:#22c55e;--g3:#16a34a;--gold:#fbbf24;--t:#e8f5e9;--t2:#94c896;--t3:#5a805c;--red:#ef4444;--vip:#a78bfa}
*{box-sizing:border-box;margin:0;padding:0}
.app{font-family:'Noto Sans',sans-serif;background:var(--bg);color:var(--t);min-height:100vh}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.35)}70%{box-shadow:0 0 0 10px rgba(74,222,128,0)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes spin{to{transform:rotate(360deg)}}
.up{animation:fadeUp .45s ease both}
.glass{background:var(--card);backdrop-filter:blur(16px);border:1px solid var(--border);border-radius:16px}
.inp{background:var(--bg2);border:1px solid var(--border);color:var(--t);padding:11px 15px;border-radius:11px;font-size:14px;width:100%;outline:none;transition:.2s;font-family:inherit}
.inp:focus{border-color:var(--g);box-shadow:0 0 0 3px rgba(74,222,128,.12)}
.btn{border:none;padding:11px 24px;border-radius:11px;font-size:14px;font-weight:600;cursor:pointer;transition:.2s;font-family:inherit}
.btn:hover{transform:translateY(-1px)}.btn:disabled{opacity:.4;cursor:not-allowed;transform:none}
.btn-g{background:linear-gradient(135deg,var(--g3),var(--g2));color:#fff}
.btn-gold{background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#000;font-weight:700}
.btn-o{background:transparent;color:var(--t2);border:1px solid var(--border2)}.btn-o:hover{border-color:var(--g);color:var(--g)}
.pbadge{background:linear-gradient(135deg,#fbbf24,#f59e0b,#d97706);background-size:200% 200%;animation:shimmer 3s linear infinite;color:#000;font-weight:700;padding:2px 9px;border-radius:16px;font-size:10px}
.vbadge{background:linear-gradient(135deg,#a78bfa,#7c3aed,#6d28d9);background-size:200% 200%;animation:shimmer 3s linear infinite;color:#fff;font-weight:700;padding:2px 9px;border-radius:16px;font-size:10px}
.sev{display:inline-flex;align-items:center;padding:2px 9px;border-radius:16px;font-size:11px;font-weight:600}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:100;padding:16px}
.loader{width:20px;height:20px;border:2px solid var(--border2);border-top-color:var(--g);border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
.nav{position:sticky;top:0;z-index:50;background:rgba(6,13,6,.88);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);padding:10px 16px;display:flex;align-items:center;justify-content:space-between}
.upload{border:2px dashed var(--border2);border-radius:14px;padding:40px 16px;text-align:center;cursor:pointer;transition:.3s}
.upload:hover{border-color:var(--g);background:rgba(74,222,128,.04)}
.dc{border-radius:13px;padding:14px;transition:.2s}.dc:hover{transform:translateY(-1px)}
`;

export default function PlantAI(){
  const [user,setUser]=useState(null);
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState({name:"",email:"",pw:""});
  const [err,setErr]=useState("");
  const [tab,setTab]=useState("diagnose");
  const [crop,setCrop]=useState("");
  const [img,setImg]=useState(null);
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [hist,setHist]=useState([]);
  const [search,setSearch]=useState("");
  const [soilImg,setSoilImg]=useState(null);
  const [soilResult,setSoilResult]=useState(null);
  const [soilLoading,setSoilLoading]=useState(false);
  const [soilProgress,setSoilProgress]=useState("");
  const soilRef=useRef(null);
  const fRef=useRef(null);
  const [users,setUsers]=useState([]);
  const [storageOk,setStorageOk]=useState(false);
  useEffect(()=>{ (async()=>{ try{ const r=localStorage.getItem("plantai_users"); if(r)setUsers(JSON.parse(r)); }catch{} setStorageOk(true); })(); },[]);
  useEffect(()=>{ if(!storageOk||users.length===0)return; (async()=>{ try{localStorage.setItem("plantai_users",JSON.stringify(users));}catch{} })(); },[users,storageOk]);

  const isPrem=user?.tier==="premium"||user?.tier==="vip";
  const isVip=user?.tier==="vip";
  const sevMap={low:{bg:"#052e16",c:"#4ade80",l:"Бага"},medium:{bg:"#422006",c:"#fbbf24",l:"Дунд"},high:{bg:"#431407",c:"#f97316",l:"Өндөр"},critical:{bg:"#450a0a",c:"#ef4444",l:"Маш өндөр"}};
  const typeL={fungal:"🍄 Мөөгөнцөр",bacterial:"🦠 Бактер",viral:"🧬 Вирус",abiotic:"🌡 Халдваргүй",complex:"⚠ Холимог"};
  const allD=Object.entries(DB).flatMap(([k,c])=>c.diseases.map(d=>({...d,crop:c.name,icon:c.icon,cropKey:k})));

  const login=()=>{
    const u=users.find(x=>x.email===form.email&&x.pw===form.pw);
    if(u){setUser(u);setModal(null);setErr("");if(!u.tier||u.tier==="free")setTimeout(()=>setModal("pricing"),600);}
    else setErr("Имэйл эсвэл нууц үг буруу");
  };
  const register=()=>{
    if(!form.name||!form.email||!form.pw)return setErr("Бүх талбарыг бөглөнө үү");
    if(form.pw.length<6)return setErr("Нууц үг 6+ тэмдэгт");
    if(users.find(u=>u.email===form.email))return setErr("Энэ имэйл бүртгэлтэй байна");
    const nu={name:form.name,email:form.email,pw:form.pw,tier:"free"};
    setUsers(prev=>[...prev,nu]);
    setUser(nu);setModal(null);setErr("");
    setTimeout(()=>setModal("pricing"),600);
  };
  const upgrade=(t)=>{if(user){const u={...user,tier:t};setUser(u);setUsers(prev=>prev.map(x=>x.email===u.email?u:x));}setModal(null);};

  const resetSoil=()=>{setSoilImg(null);setSoilResult(null);if(soilRef.current)soilRef.current.value="";};
  const handleSoilImage=(file)=>{if(!file)return;const r=new FileReader();r.onload=(ev)=>{setSoilImg(ev.target.result);setSoilResult(null);};r.readAsDataURL(file);};

  const analyzeSoil=async()=>{
    if(!soilImg)return;
    if(!user)return setModal("login");
    setSoilLoading(true);setSoilResult(null);setSoilProgress("Хөрсний зургийг бэлдэж байна...");

    const tierNote=isVip
      ?"\n[VIP] Маш нарийвчилсан: микроэлемент, хүчиллэг/суурилаг тэнцвэр, бичил биетний идэвхжил, ялзмагийн задралын түвшин, Монгол бүс нутгийн хөрсний онцлог, GPS-д суурилсан зөвлөмж оруул."
      :isPrem?"\n[Premium] Дэлгэрэнгүй: макро/микро элемент, бордооны зөвлөмж, тариалалтын төлөвлөгөө оруул.":"";

    const sysMsg="Чи Монголын хөрс судлалын мэргэжилтэн AI. Хэрэглэгчийн илгээсэн хөрсний зургийг шинжилж, хөрсний төрөл, чанар, тохирох таримлыг тодорхойлно. ЗААВАЛ зөвхөн JSON хариулт. Markdown бичихгүй.";

    const userMsg="Энэ хөрсний зургийг нягтлан шинжлээд доорх JSON бүтцийг бөглөнө үү."+tierNote+"\n\nЗургаас хөрсний өнгө, бүтэц, чийглэг, ялзмаг, чулуулаг, хагшаас зэргийг тодорхойлж шинжилнэ.\n\nЧУХАЛ: Бүх талбарыг ДУГААРЛАЖ бичнэ (1) 2) 3) гэх мэт).\n\n{\"soil_type\":\"хөрсний Монгол нэр\",\"texture\":\"бүтэц (элсэрхэг/шаварлаг/хөнгөн шавранцар гэх мэт)\",\"color_desc\":\"өнгөний тодорхойлолт\",\"ph_estimate\":\"таамаг pH утга (жишээ: 6.5-7.0)\",\"organic_matter\":\"ялзмагийн түвшин (бага/дунд/өндөр)\",\"quality\":\"low эсвэл medium эсвэл good эсвэл excellent\",\"moisture\":\"чийглэгийн түвшин\",\"description\":\"1) Хөрсний ерөнхий тодорхойлолт. 2) Бүтэц. 3) Ялзмаг.\",\"nutrients\":\"1) Азот (N) түвшин. 2) Фосфор (P). 3) Кали (K). 4) Бусад.\",\"suitable_crops\":\"1) Хамгийн тохирох таримал. 2) Дараагийн. 3) Бусад.\",\"recommendations\":\"1) Хөрс сайжруулах арга. 2) Бордооны зөвлөмж. 3) Усалгаа. 4) Бусад.\",\"risks\":\"1) Эрсдэл. 2) Анхааруулга.\",\"details\":\"нэмэлт мэргэжлийн мэдээлэл\"}";

    const imgData=soilImg.split(",")[1];
    const mt=soilImg.startsWith("data:image/png")?"image/png":soilImg.startsWith("data:image/webp")?"image/webp":"image/jpeg";

    let parsed=null,fallback="";
    for(let attempt=1;attempt<=3&&!parsed;attempt++){
      setSoilProgress(attempt===1?"AI хөрсийг шинжилж байна...":"Дахин оролдож байна ("+attempt+"/3)...");
      try{
        const extra=attempt>1?"\nЗӨВХӨН JSON. Markdown бичихгүй!":"";
        const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:3000,system:sysMsg,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:mt,data:imgData}},{type:"text",text:userMsg+extra}]}]})});
        if(!resp.ok){fallback="Сервер алдаа: "+resp.status;continue;}
        const data=await resp.json();
        if(data.error){fallback=data.error.message||"API алдаа";continue;}
        const text=(data.content||[]).map(c=>c.text||"").join("");
        if(!text){fallback="Хоосон хариулт";continue;}
        parsed=safeJSON(text);
        if(!parsed)fallback=text.slice(0,300);
      }catch(e){fallback="Холболтын алдаа: "+(e.message||"Интернэт шалгана уу");}
    }
    setSoilProgress("");
    if(parsed&&parsed.soil_type){
      const qualMap={low:"Муу",medium:"Дунд",good:"Сайн",excellent:"Маш сайн"};
      const qualColor={low:"#ef4444",medium:"#fbbf24",good:"#4ade80",excellent:"#22d3ee"};
      setSoilResult({...parsed,qualLabel:qualMap[parsed.quality]||"Дунд",qualColor:qualColor[parsed.quality]||"#fbbf24"});
    }else{
      setSoilResult({soil_type:"Тодорхойлогдсонгүй",description:fallback||"Зургийг таниж чадсангүй.",quality:"medium",qualLabel:"Тодорхойгүй",qualColor:"#fbbf24",recommendations:"Хөрсний лабораторийн шинжилгээ хийлгэхийг зөвлөж байна."});
    }
    setSoilLoading(false);
  };

  const resetDiag=()=>{setCrop("");setImg(null);setResult(null);if(fRef.current)fRef.current.value="";};

  /* ═══ TEXT FORMATTER — numbered lists, bullets, paragraphs ═══ */
  const Fmt=({text,color})=>{
    if(!text)return null;
    const c=color||"var(--t)";
    // Split into lines/segments by newlines or numbered patterns
    const raw=String(text)
      .replace(/(\d+)\)\s*/g,"\n$1) ")           // "1) " on new line
      .replace(/(\d+)\.\s+(?=[А-ЯA-ZҮӨ])/g,"\n$1. ")  // "1. Текст" only when followed by uppercase letter
              // bullet on new line
      .replace(/\n{3,}/g,"\n\n");

    const lines=raw.split("\n").map(l=>l.trim()).filter(Boolean);

    return <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {lines.map((line,i)=>{
        // Numbered item: "1) ..." or "1. ..."
        const numMatch=line.match(/^(\d+)[.)]\s*(.*)/);
        if(numMatch){
          return <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
            <span style={{minWidth:22,height:22,borderRadius:6,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:c,flexShrink:0,marginTop:1}}>{numMatch[1]}</span>
            <span style={{fontSize:13,lineHeight:1.65,color:"var(--t)"}}>{numMatch[2]}</span>
          </div>;
        }
        // Bullet item: "• ..." -> render as plain text
        if(line.startsWith("•")){
          return <p key={i} style={{fontSize:13,lineHeight:1.65,color:"var(--t)",margin:0,paddingLeft:4}}>{line.slice(1).trim()}</p>;
        }
        // Sub-item with dash: "- ..."
        if(line.startsWith("-")){
          return <p key={i} style={{fontSize:12,lineHeight:1.6,color:"var(--t2)",margin:0,paddingLeft:8}}>{line.slice(1).trim()}</p>;
        }
        // Bold-like header: text ending with ":"
        if(line.endsWith(":")){
          return <div key={i} style={{fontSize:13,fontWeight:600,color:c,marginTop:i>0?4:0}}>{line}</div>;
        }
        // Regular paragraph
        return <p key={i} style={{fontSize:13,lineHeight:1.65,color:"var(--t)",margin:0}}>{line}</p>;
      })}
    </div>;
  };

  const handleImage=(file)=>{
    if(!file)return;
    const r=new FileReader();
    r.onload=(ev)=>{setImg(ev.target.result);setResult(null);};
    r.readAsDataURL(file);
  };

  /* robust JSON extractor - handles markdown fences, trailing commas, malformed JSON */
  const safeJSON=(text)=>{
    if(!text)return null;
    // Strip markdown code fences
    let raw=text;
    const fence=raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if(fence)raw=fence[1].trim();
    // Find outermost JSON object
    let depth=0,start=-1;
    for(let i=0;i<raw.length;i++){
      if(raw[i]==="{"){if(start<0)start=i;depth++;}
      if(raw[i]==="}"){depth--;if(depth===0&&start>=0){
        const chunk=raw.slice(start,i+1);
        try{return JSON.parse(chunk);}catch{
          // Fix common issues: trailing commas, unescaped newlines
          const fixed=chunk.replace(/,\s*([}\]])/g,"$1").replace(/[\r\n]+/g," ").replace(/\t/g," ");
          try{return JSON.parse(fixed);}catch{/* try next brace pair */}
        }
        start=-1;
      }}
    }
    return null;
  };

  /* Find best matching disease from DB for fallback */
  const findDBMatch=(cropKey, diseaseName)=>{
    const search=(diseaseName||"").toLowerCase();
    let candidates=[];
    if(cropKey&&DB[cropKey])candidates=DB[cropKey].diseases;
    else candidates=Object.values(DB).flatMap(c=>c.diseases);
    return candidates.find(d=>search.includes(d.name.toLowerCase())||d.name.toLowerCase().includes(search))||null;
  };

  /* ═══ DIAGNOSE ═══ */
  const [progress,setProgress]=useState("");
  const diagnose=async()=>{
    if(!img)return;
    if(!user)return setModal("login");
    setLoading(true);setResult(null);setProgress("Зургийг бэлдэж байна...");

    // Build comprehensive DB context
    let dbCtx="\n\n===== УРГАМЛЫН ӨВЧНИЙ МЭДЛЭГИЙН САН =====\n";
    if(crop&&DB[crop]){
      dbCtx+="["+DB[crop].name+" таримлын бүх мэдэгдэж буй өвчнүүд]\n";
      DB[crop].diseases.forEach((d,i)=>{
        dbCtx+=(i+1)+". "+d.name+"\n   Үүсгэгч: "+d.pathogen+"\n   Төрөл: "+d.type+" | Хүндийн зэрэг: "+d.severity+
          "\n   Шинж тэмдэг: "+d.symptoms+"\n   Эмчилгээ: "+d.treatment+"\n\n";
      });
    }else{
      Object.entries(DB).forEach(([k,c])=>{
        dbCtx+="["+c.icon+" "+c.name+"]\n";
        c.diseases.forEach(d=>{
          dbCtx+="• "+d.name+" ("+d.pathogen+") ["+d.type+"]: "+d.symptoms+" → "+d.treatment+"\n";
        });
        dbCtx+="\n";
      });
    }

    const tierNote=isVip
      ?"\n\n[VIP ГОРИМ] Маш нарийвчилсан мэргэжлийн хариулт өгнө:\n- Микроскопийн шинжилгээний зөвлөмж\n- Биологийн хяналтын арга\n- Дифференциал оношлогоо (ижил шинж тэмдэгтэй бусад өвчнөөс ялгах)\n- Монгол орны уур амьсгалд тусгай зөвлөмж"
      :isPrem?"\n\n[PREMIUM ГОРИМ] Дэлгэрэнгүй хариулт: дифференциал оношлогоо, нарийвчилсан зөвлөмж оруул."
      :"";

    const systemMsg=`Чи Монголын ургамлын өвчний оношлогооны мэргэжилтэн AI. Чиний гол зорилго: хэрэглэгчийн оруулсан зургийг нягтлан шинжилж, ургамлын өвчнийг оношилж, эмчлэх арга болон урьдчилан сэргийлэх аргыг ТУСДАА, ДЭЛГЭРЭНГҮЙ бичих юм.

ЧУХАЛ ДҮРМҮҮД:
1. Зөвхөн нэг JSON объект хариулна — тайлбар, markdown, код блок БИЧИХГҮЙ
2. JSON-ий өмнө ба хойно ямар ч текст байхгүй
3. treatment болон prevention талбаруудыг ЗААВАЛ бөглөнө — хоосон байж БОЛОХГҮЙ
4. Бүх текст Монгол хэлээр байна`;

    const userMsg=`Дээрх зургийг нягтлан шинжлээд доорх JSON бүтцийг бөглөнө үү.
${dbCtx}
${crop?"Хэрэглэгч сонгосон таримал: "+DB[crop]?.name:"Таримлыг зургаас тодорхойлно уу."}${tierNote}

ЧУХАЛ ФОРМАТ:
- treatment, prevention, description, details талбаруудыг ДУГААРЛАЖ бичнэ.
- Жишээ: "1) Эхний алхам. 2) Хоёр дахь алхам. 3) Гурав дахь алхам."
- Мөр бүр тусдаа санааг илэрхийлнэ. 
- treatment = Одоо хийх эмчилгээ. Химийн бэлдмэл нэр, тун, хэрэглэх арга, биологийн арга, механик арга.
- prevention = Ирээдүйд сэргийлэх арга. Сэлгэх тариалалт, тэсвэртэй сорт, хөрс боловсруулах, ариутгал.
- description = Зургаас харагдаж буй шинж тэмдгүүд дугаарлан.

JSON БҮТЭЦ:
{"disease_name":"өвчний Монгол нэр","pathogen":"латин нэр","type":"fungal эсвэл bacterial эсвэл viral эсвэл abiotic эсвэл complex","severity":"low эсвэл medium эсвэл high эсвэл critical","confidence":75,"description":"1) Эхний шинж тэмдэг. 2) Хоёр дахь шинж тэмдэг. 3) Гурав дахь.","treatment":"1) Химийн арга: бэлдмэлийн нэр, тун. 2) Биологийн арга. 3) Механик арга.","prevention":"1) Сэлгэх тариалалт. 2) Тэсвэртэй сорт. 3) Үрийн ариутгал. 4) Хөрс боловсруулах.","details":"1) Дифференциал оношлогоо. 2) Нэмэлт мэдээлэл."}`;

    const imgData=img.split(",")[1];
    const mt=img.startsWith("data:image/png")?"image/png":img.startsWith("data:image/webp")?"image/webp":"image/jpeg";

    let parsed=null;
    let fallback="";
    const maxAttempts=3;

    for(let attempt=1;attempt<=maxAttempts&&!parsed;attempt++){
      setProgress(attempt===1?"AI зургийг шинжилж байна...":attempt===2?"Дахин оролдож байна ("+attempt+"/"+maxAttempts+")...":"Сүүлийн оролдлого...");
      try{
        const extraNote=attempt>1?"\n\nАнхааруулга: Зөвхөн JSON объект. { } хаалтаар эхэлж төгсөнө. Markdown, тайлбар бичихгүй. treatment болон prevention заавал бөглөнө!":"";
        const resp=await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            model:"claude-sonnet-4-20250514",
            max_tokens:3000,
            system:systemMsg,
            messages:[{role:"user",content:[
              {type:"image",source:{type:"base64",media_type:mt,data:imgData}},
              {type:"text",text:userMsg+extraNote}
            ]}]
          }),
        });
        if(!resp.ok){
          const errText=await resp.text().catch(()=>"");
          fallback="Сервер алдаа ("+resp.status+"): "+(errText.slice(0,100)||"Дахин оролдоно уу");
          continue;
        }
        const data=await resp.json();
        if(data.error){fallback=data.error.message||"API алдаа";continue;}
        const text=(data.content||[]).map(c=>c.text||"").join("");
        if(!text){fallback="Хоосон хариулт ирлээ";continue;}
        parsed=safeJSON(text);
        if(!parsed)fallback=text.slice(0,300);
      }catch(e){
        fallback="Холболтын алдаа: "+(e.message||"Интернэт холболтоо шалгана уу");
      }
    }

    setProgress("");

    if(parsed&&parsed.disease_name){
      const validSev=["low","medium","high","critical"];
      const validType=["fungal","bacterial","viral","abiotic","complex"];
      // Get DB fallback for treatment/prevention if AI missed them
      const dbMatch=findDBMatch(crop,parsed.disease_name);
      const res={
        disease_name:String(parsed.disease_name||"Тодорхойгүй"),
        pathogen:String(parsed.pathogen||dbMatch?.pathogen||""),
        type:validType.includes(parsed.type)?parsed.type:(dbMatch?.type||"complex"),
        severity:validSev.includes(parsed.severity)?parsed.severity:(dbMatch?.severity||"medium"),
        confidence:Math.max(0,Math.min(100,Number(parsed.confidence)||70)),
        description:String(parsed.description||"Зургаас шинж тэмдэг илэрсэн."),
        treatment:String(parsed.treatment||dbMatch?.treatment||"Мэргэжилтэнд хандана уу."),
        prevention:String(parsed.prevention||"Сэлгэх тариалалт, тэсвэртэй сорт сонгох, үрийн материалыг ариутгах."),
        details:String(parsed.details||""),
        source:"ai",
      };
      setResult(res);
      setHist(h=>[{...res,date:new Date().toLocaleString(),thumb:img},...h].slice(0,30));
    }else{
      // Fallback result with meaningful info
      setResult({
        disease_name:"Оношлогоо тодорхойлогдсонгүй",
        description:fallback||"Зургийг таниж чадсангүй. Илүү ойроос зургийг дахин авна уу.",
        severity:"medium",
        treatment:"Мэргэжилтэн зөвлөгөө авахыг зөвлөж байна. Гэмтсэн навч, ишийг цэвэрлэж устгана уу.",
        prevention:"Ургамлыг тогтмол шалгаж, шинж тэмдэг эрт илрүүлэх. Ургамлын үлдэгдлийг цэвэрлэх.",
        source:"fallback",
      });
    }
    setLoading(false);
  };

  const filtered=search?allD.filter(d=>(d.name+d.crop+d.pathogen+d.symptoms).toLowerCase().includes(search.toLowerCase())):allD;

  /* ═══════════ RENDER ═══════════ */
  return (
    <div className="app">
      <style>{CSS}</style>

      {/* NAV */}
      <div className="nav">
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:22,cursor:"pointer"}} onClick={()=>setTab("diagnose")}>🌿</span>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"var(--g)",cursor:"pointer"}} onClick={()=>setTab("diagnose")}>PlantAI</span>
          {isPrem&&<span className={isVip?"vbadge":"pbadge"}>{isVip?"VIP":"PREMIUM"}</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <button className="btn" onClick={()=>setTab("encyclopedia")} style={{padding:"5px 10px",fontSize:11,background:tab==="encyclopedia"?"var(--bg3)":"transparent",color:tab==="encyclopedia"?"var(--g)":"var(--t3)",border:"none"}}>📚 Лавлах</button>
          <button className="btn" onClick={()=>setTab("history")} style={{padding:"5px 10px",fontSize:11,background:tab==="history"?"var(--bg3)":"transparent",color:tab==="history"?"var(--g)":"var(--t3)",border:"none"}}>📋 Түүх</button>
          <div style={{width:1,height:16,background:"var(--border)",margin:"0 4px"}}/>
          {user?(
            <>
              <span style={{fontSize:12,color:"var(--t2)"}}>{user.name}</span>
              {!isPrem&&<button className="btn btn-gold" style={{padding:"5px 10px",fontSize:10}} onClick={()=>setModal("pricing")}>⭐ Эрх</button>}
              {isPrem&&!isVip&&<button className="btn" style={{padding:"5px 10px",fontSize:10,background:"linear-gradient(135deg,#a78bfa,#7c3aed)",color:"#fff"}} onClick={()=>setModal("pricing")}>💎 VIP</button>}
              <button className="btn btn-o" style={{padding:"5px 10px",fontSize:11}} onClick={()=>{setUser(null);setResult(null);setHist([]);}}>Гарах</button>
            </>
          ):(
            <>
              <button className="btn btn-o" style={{padding:"5px 12px",fontSize:12}} onClick={()=>{setModal("login");setErr("");setForm({name:"",email:"",pw:""});}}>Нэвтрэх</button>
              <button className="btn btn-g" style={{padding:"5px 12px",fontSize:12}} onClick={()=>{setModal("register");setErr("");setForm({name:"",email:"",pw:""});}}>Бүртгүүлэх</button>
            </>
          )}
        </div>
      </div>

      {/* HERO */}
      {(tab==="diagnose"||tab==="soil")&&<div className="up" style={{textAlign:"center",padding:"28px 16px 14px"}}>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:34,fontWeight:700,background:"linear-gradient(135deg,var(--g),#86efac,var(--gold))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>🌱 PlantAI</h1>
        <p style={{color:"var(--t2)",fontSize:13,marginTop:4}}>Ургамлын өвчин оношлогоо & Хөрсний AI шинжилгээ</p>
        <p style={{color:"var(--t3)",fontSize:11,marginTop:2}}>{allD.length}+ өвчин • {Object.keys(DB).length} таримал • Хөрсний шинжилгээ</p>
      </div>}

      {/* TABS */}
      {(tab==="diagnose"||tab==="soil")&&<div style={{display:"flex",justifyContent:"center",gap:8,padding:"0 16px 14px"}}>
        <button className="btn" onClick={()=>setTab("diagnose")} style={{flex:1,maxWidth:220,padding:"12px 16px",fontSize:14,fontWeight:600,background:tab==="diagnose"?"var(--g3)":"var(--bg3)",color:tab==="diagnose"?"#fff":"var(--t3)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>🔬 Ургамал оношлогоо</button>
        <button className="btn" onClick={()=>setTab("soil")} style={{flex:1,maxWidth:220,padding:"12px 16px",fontSize:14,fontWeight:600,background:tab==="soil"?"linear-gradient(135deg,#854d0e,#a16207)":"var(--bg3)",color:tab==="soil"?"#fff":"var(--t3)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>🌍 Хөрсний шинжилгээ</button>
      </div>}

      <div style={{maxWidth:680,margin:"0 auto",padding:"0 16px 36px"}}>

        {/* ══════ DIAGNOSE ══════ */}
        {tab==="diagnose"&&(
          <div className="up">
            {!result?(
              <>
                {/* Image upload */}
                <div className="glass" style={{padding:20,marginBottom:12}}>
                  <input type="file" ref={fRef} accept="image/*" onChange={e=>handleImage(e.target.files?.[0])} style={{display:"none"}}/>
                  {img?(
                    <div>
                      <div style={{position:"relative",marginBottom:12}}>
                        <img src={img} alt="" style={{width:"100%",maxHeight:280,objectFit:"cover",borderRadius:12}}/>
                        <button onClick={resetDiag} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.7)",color:"#fff",border:"none",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:12}}>✕</button>
                      </div>
                      <div style={{fontSize:12,color:"var(--g)",textAlign:"center"}}>✅ Зураг бэлэн</div>
                    </div>
                  ):(
                    <div className="upload" onClick={()=>fRef.current?.click()}>
                      <div style={{fontSize:48,marginBottom:8}}>📷</div>
                      <div style={{color:"var(--g)",fontSize:16,fontWeight:600,marginBottom:4}}>Ургамлын зургаа оруулна уу</div>
                      <div style={{color:"var(--t3)",fontSize:12}}>Өвчилсөн навч, иш, жимс, булцууны зураг</div>
                    </div>
                  )}
                </div>

                {/* Crop select */}
                {img&&(
                  <div className="glass up" style={{padding:14,marginBottom:12}}>
                    <div style={{fontSize:12,fontWeight:600,color:"var(--t2)",marginBottom:8}}>Таримал сонгох <span style={{fontWeight:400,color:"var(--t3)"}}>(заавал биш)</span></div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                      {Object.entries(DB).map(([k,c])=>(
                        <button key={k} onClick={()=>setCrop(crop===k?"":k)} style={{padding:"5px 12px",borderRadius:9,fontSize:12,border:"1px solid",borderColor:crop===k?"var(--g)":"var(--border)",background:crop===k?"rgba(74,222,128,.1)":"var(--bg2)",color:crop===k?"var(--g)":"var(--t3)",cursor:"pointer",fontFamily:"inherit"}}>{c.icon} {c.name}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Diagnose button */}
                {img&&(
                  <button className="btn btn-g" onClick={diagnose} disabled={loading} style={{width:"100%",padding:14,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",gap:8,animation:!loading?"pulse 2s infinite":"none"}}>
                    {loading?(<><span className="loader"/> {progress||"Зургийг шинжилж байна..."}</>):"🔬 Оношлогоо хийх"}
                  </button>
                )}
                {!user&&img&&<p style={{textAlign:"center",marginTop:8,fontSize:12,color:"var(--t3)"}}>Оношлогоо хийхийн тулд <span style={{color:"var(--g)",cursor:"pointer"}} onClick={()=>setModal("login")}>нэвтрэх</span> шаардлагатай</p>}
              </>
            ):(
              /* ═══ RESULT ═══ */
              <div className="up" style={{display:"flex",flexDirection:"column",gap:12}}>

                {/* Header */}
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  {img&&<img src={img} alt="" style={{width:56,height:56,objectFit:"cover",borderRadius:10,border:"1px solid var(--border)"}}/>}
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,color:"var(--t3)"}}>Оношлогооны үр дүн</div>
                    {crop&&<div style={{fontSize:11,color:"var(--t3)"}}>{DB[crop]?.icon} {DB[crop]?.name}</div>}
                  </div>
                  <button className="btn btn-o" onClick={resetDiag} style={{padding:"6px 14px",fontSize:12}}>📷 Шинэ зураг</button>
                </div>

                {/* 1. Diagnosis */}
                <div className="glass" style={{padding:20}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"var(--g)"}}>{result.disease_name}</h3>
                    {result.severity&&<span className="sev" style={{background:sevMap[result.severity]?.bg,color:sevMap[result.severity]?.c}}>{sevMap[result.severity]?.l}</span>}
                  </div>
                  {result.pathogen&&(
                    <div style={{fontSize:12,color:"var(--t3)",marginBottom:12,fontStyle:"italic"}}>
                      {typeL[result.type]||""} • {result.pathogen}
                      {result.confidence>0&&<span style={{marginLeft:6,background:"rgba(74,222,128,.1)",padding:"1px 7px",borderRadius:8,color:"var(--g)",fontStyle:"normal",fontWeight:600}}>{result.confidence}%</span>}
                    </div>
                  )}
                  {result.description&&(
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--t2)",marginBottom:5}}>📋 Шинж тэмдэг</div>
                      <Fmt text={result.description} color="var(--t2)"/>
                    </div>
                  )}
                </div>

                {/* 2. Treatment - SEPARATE card */}
                {result.treatment&&(
                  <div className="glass" style={{padding:20,borderColor:"rgba(74,222,128,.2)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <div style={{width:36,height:36,borderRadius:10,background:"rgba(74,222,128,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💊</div>
                      <div>
                        <div style={{fontSize:15,fontWeight:700,color:"var(--g)"}}>Эмчлэх арга</div>
                        <div style={{fontSize:11,color:"var(--t3)"}}>Одоо хийх ёстой арга хэмжээ</div>
                      </div>
                    </div>
                    <div style={{background:"rgba(74,222,128,.04)",padding:14,borderRadius:12,border:"1px solid rgba(74,222,128,.08)"}}>
                      <Fmt text={result.treatment} color="var(--g)"/>
                    </div>
                  </div>
                )}

                {/* 3. Prevention - SEPARATE card */}
                {result.prevention&&(
                  <div className="glass" style={{padding:20,borderColor:"rgba(251,191,36,.2)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <div style={{width:36,height:36,borderRadius:10,background:"rgba(251,191,36,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🛡</div>
                      <div>
                        <div style={{fontSize:15,fontWeight:700,color:"var(--gold)"}}>Урьдчилан сэргийлэх</div>
                        <div style={{fontSize:11,color:"var(--t3)"}}>Дараа жил/улирлаас авах арга хэмжээ</div>
                      </div>
                    </div>
                    <div style={{background:"rgba(251,191,36,.04)",padding:14,borderRadius:12,border:"1px solid rgba(251,191,36,.08)"}}>
                      <Fmt text={result.prevention} color="var(--gold)"/>
                    </div>
                  </div>
                )}

                {/* 4. Premium/VIP details */}
                {result.details&&isPrem&&(
                  <div className="glass" style={{padding:20,borderColor:isVip?"rgba(167,139,250,.2)":"rgba(251,191,36,.2)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <div style={{width:36,height:36,borderRadius:10,background:isVip?"rgba(167,139,250,.1)":"rgba(251,191,36,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{isVip?"💎":"⭐"}</div>
                      <div>
                        <div style={{fontSize:15,fontWeight:700,color:isVip?"var(--vip)":"var(--gold)"}}>{isVip?"VIP":"Premium"} дэлгэрэнгүй</div>
                        <div style={{fontSize:11,color:"var(--t3)"}}>Мэргэжлийн нэмэлт мэдээлэл</div>
                      </div>
                    </div>
                    <div style={{background:isVip?"rgba(167,139,250,.04)":"rgba(251,191,36,.04)",padding:14,borderRadius:12,border:"1px solid "+(isVip?"rgba(167,139,250,.08)":"rgba(251,191,36,.08)")}}>
                      <Fmt text={result.details} color={isVip?"var(--vip)":"var(--gold)"}/>
                    </div>
                  </div>
                )}
                {result.details&&!isPrem&&(
                  <div className="glass" style={{padding:16,textAlign:"center",borderColor:"rgba(251,191,36,.15)"}}>
                    <p style={{fontSize:12,color:"var(--gold)",marginBottom:6}}>⭐ Нэмэлт мэдээлэл Premium / VIP эрхтэй</p>
                    <button className="btn btn-gold" style={{padding:"6px 16px",fontSize:12}} onClick={()=>setModal("pricing")}>Эрх авах</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        
        {/* ══════ SOIL ANALYSIS ══════ */}
        {tab==="soil"&&(
          <div className="up">
            {!soilResult?(
              <>
                <div className="glass" style={{padding:20,marginBottom:12}}>
                  <input type="file" ref={soilRef} accept="image/*" onChange={e=>handleSoilImage(e.target.files?.[0])} style={{display:"none"}}/>
                  {soilImg?(
                    <div>
                      <div style={{position:"relative",marginBottom:12}}>
                        <img src={soilImg} alt="" style={{width:"100%",maxHeight:280,objectFit:"cover",borderRadius:12}}/>
                        <button onClick={resetSoil} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.7)",color:"#fff",border:"none",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:12}}>✕</button>
                      </div>
                      <div style={{fontSize:12,color:"var(--g)",textAlign:"center"}}>✅ Зураг бэлэн</div>
                    </div>
                  ):(
                    <div className="upload" onClick={()=>soilRef.current?.click()}>
                      <div style={{fontSize:48,marginBottom:8}}>🌍</div>
                      <div style={{color:"var(--g)",fontSize:16,fontWeight:600,marginBottom:4}}>Хөрсний зургаа оруулна уу</div>
                      <div style={{color:"var(--t3)",fontSize:12}}>Талбайн хөрс, хагшаас, малтсан хөрсний зүсэлтийн зураг</div>
                    </div>
                  )}
                </div>
                {soilImg&&(
                  <button className="btn btn-g" onClick={analyzeSoil} disabled={soilLoading} style={{width:"100%",padding:14,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",gap:8,animation:!soilLoading?"pulse 2s infinite":"none"}}>
                    {soilLoading?(<><span className="loader"/> {soilProgress||"Шинжилж байна..."}</>):"🌍 Хөрс шинжлэх"}
                  </button>
                )}
                {!user&&soilImg&&<p style={{textAlign:"center",marginTop:8,fontSize:12,color:"var(--t3)"}}>Шинжилгээ хийхийн тулд <span style={{color:"var(--g)",cursor:"pointer"}} onClick={()=>setModal("login")}>нэвтрэх</span> шаардлагатай</p>}
              </>
            ):(
              <div className="up" style={{display:"flex",flexDirection:"column",gap:12}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  {soilImg&&<img src={soilImg} alt="" style={{width:56,height:56,objectFit:"cover",borderRadius:10,border:"1px solid var(--border)"}}/>}
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,color:"var(--t3)"}}>Хөрсний шинжилгээ</div>
                    <div style={{fontSize:16,fontWeight:700,color:"var(--g)"}}>{soilResult.soil_type}</div>
                  </div>
                  <button className="btn btn-o" onClick={resetSoil} style={{padding:"6px 14px",fontSize:12}}>🌍 Шинэ зураг</button>
                </div>

                <div className="glass" style={{padding:20}}>
                  <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:14}}>
                    {soilResult.quality&&<div style={{background:"rgba(0,0,0,.3)",borderRadius:10,padding:"8px 14px",flex:1,minWidth:120,textAlign:"center"}}><div style={{fontSize:10,color:"var(--t3)"}}>Чанар</div><div style={{fontSize:16,fontWeight:700,color:soilResult.qualColor}}>{soilResult.qualLabel}</div></div>}
                    {soilResult.ph_estimate&&<div style={{background:"rgba(0,0,0,.3)",borderRadius:10,padding:"8px 14px",flex:1,minWidth:120,textAlign:"center"}}><div style={{fontSize:10,color:"var(--t3)"}}>pH түвшин</div><div style={{fontSize:16,fontWeight:700,color:"var(--g)"}}>{soilResult.ph_estimate}</div></div>}
                    {soilResult.organic_matter&&<div style={{background:"rgba(0,0,0,.3)",borderRadius:10,padding:"8px 14px",flex:1,minWidth:120,textAlign:"center"}}><div style={{fontSize:10,color:"var(--t3)"}}>Ялзмаг</div><div style={{fontSize:16,fontWeight:700,color:"var(--gold)"}}>{soilResult.organic_matter}</div></div>}
                    {soilResult.moisture&&<div style={{background:"rgba(0,0,0,.3)",borderRadius:10,padding:"8px 14px",flex:1,minWidth:120,textAlign:"center"}}><div style={{fontSize:10,color:"var(--t3)"}}>Чийглэг</div><div style={{fontSize:16,fontWeight:700,color:"#60a5fa"}}>{soilResult.moisture}</div></div>}
                  </div>
                  {soilResult.texture&&<div style={{fontSize:12,color:"var(--t3)",marginBottom:6}}>🧱 Бүтэц: <span style={{color:"var(--t)"}}>{soilResult.texture}</span></div>}
                  {soilResult.color_desc&&<div style={{fontSize:12,color:"var(--t3)",marginBottom:10}}>🎨 Өнгө: <span style={{color:"var(--t)"}}>{soilResult.color_desc}</span></div>}
                  {soilResult.description&&<div style={{marginTop:6}}><div style={{fontSize:13,fontWeight:600,color:"var(--t2)",marginBottom:5}}>📋 Ерөнхий тодорхойлолт</div><Fmt text={soilResult.description} color="var(--t2)"/></div>}
                </div>

                {soilResult.nutrients&&(
                  <div className="glass" style={{padding:20,borderColor:"rgba(74,222,128,.2)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <div style={{width:36,height:36,borderRadius:10,background:"rgba(74,222,128,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🧪</div>
                      <div><div style={{fontSize:15,fontWeight:700,color:"var(--g)"}}>Шим тэжээлийн бодис</div><div style={{fontSize:11,color:"var(--t3)"}}>Таамаг NPK болон бусад элементүүд</div></div>
                    </div>
                    <div style={{background:"rgba(74,222,128,.04)",padding:14,borderRadius:12,border:"1px solid rgba(74,222,128,.08)"}}><Fmt text={soilResult.nutrients} color="var(--g)"/></div>
                  </div>
                )}

                {soilResult.suitable_crops&&(
                  <div className="glass" style={{padding:20,borderColor:"rgba(251,191,36,.2)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <div style={{width:36,height:36,borderRadius:10,background:"rgba(251,191,36,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🌾</div>
                      <div><div style={{fontSize:15,fontWeight:700,color:"var(--gold)"}}>Тохирох таримал</div><div style={{fontSize:11,color:"var(--t3)"}}>Энэ хөрсөнд тариалах боломжтой</div></div>
                    </div>
                    <div style={{background:"rgba(251,191,36,.04)",padding:14,borderRadius:12,border:"1px solid rgba(251,191,36,.08)"}}><Fmt text={soilResult.suitable_crops} color="var(--gold)"/></div>
                  </div>
                )}

                {soilResult.recommendations&&(
                  <div className="glass" style={{padding:20,borderColor:"rgba(96,165,250,.2)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <div style={{width:36,height:36,borderRadius:10,background:"rgba(96,165,250,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💡</div>
                      <div><div style={{fontSize:15,fontWeight:700,color:"#60a5fa"}}>Зөвлөмж</div><div style={{fontSize:11,color:"var(--t3)"}}>Хөрс сайжруулах арга хэмжээ</div></div>
                    </div>
                    <div style={{background:"rgba(96,165,250,.04)",padding:14,borderRadius:12,border:"1px solid rgba(96,165,250,.08)"}}><Fmt text={soilResult.recommendations} color="#60a5fa"/></div>
                  </div>
                )}

                {soilResult.risks&&(
                  <div className="glass" style={{padding:20,borderColor:"rgba(239,68,68,.2)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <div style={{width:36,height:36,borderRadius:10,background:"rgba(239,68,68,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⚠️</div>
                      <div><div style={{fontSize:15,fontWeight:700,color:"var(--red)"}}>Эрсдэл</div><div style={{fontSize:11,color:"var(--t3)"}}>Анхаарах зүйлс</div></div>
                    </div>
                    <div style={{background:"rgba(239,68,68,.04)",padding:14,borderRadius:12,border:"1px solid rgba(239,68,68,.08)"}}><Fmt text={soilResult.risks} color="var(--red)"/></div>
                  </div>
                )}

                {soilResult.details&&isPrem&&(
                  <div className="glass" style={{padding:20,borderColor:isVip?"rgba(167,139,250,.2)":"rgba(251,191,36,.2)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <div style={{width:36,height:36,borderRadius:10,background:isVip?"rgba(167,139,250,.1)":"rgba(251,191,36,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{isVip?"💎":"⭐"}</div>
                      <div><div style={{fontSize:15,fontWeight:700,color:isVip?"var(--vip)":"var(--gold)"}}>{isVip?"VIP":"Premium"} дэлгэрэнгүй</div></div>
                    </div>
                    <div style={{background:isVip?"rgba(167,139,250,.04)":"rgba(251,191,36,.04)",padding:14,borderRadius:12,border:"1px solid "+(isVip?"rgba(167,139,250,.08)":"rgba(251,191,36,.08)")}}><Fmt text={soilResult.details} color={isVip?"var(--vip)":"var(--gold)"}/></div>
                  </div>
                )}
                {soilResult.details&&!isPrem&&(
                  <div className="glass" style={{padding:16,textAlign:"center",borderColor:"rgba(251,191,36,.15)"}}>
                    <p style={{fontSize:12,color:"var(--gold)",marginBottom:6}}>⭐ Нэмэлт мэдээлэл Premium / VIP эрхтэй</p>
                    <button className="btn btn-gold" style={{padding:"6px 16px",fontSize:12}} onClick={()=>setModal("pricing")}>Эрх авах</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════ ENCYCLOPEDIA ══════ */}
        {tab==="encyclopedia"&&(
          <div className="up">
            <div style={{marginBottom:14}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:"var(--g)"}}>📚 Мэдлэгийн сан</h2><button className="btn btn-o" style={{padding:"5px 12px",fontSize:11}} onClick={()=>setTab("diagnose")}>← Буцах</button></div><p style={{fontSize:12,color:"var(--t3)",marginTop:4}}>{allD.length}+ өвчин • {Object.keys(DB).length} таримал</p></div>
            <input className="inp" placeholder="🔍 Өвчин, таримал хайх..." value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:12}}/>
            <div style={{fontSize:12,color:"var(--t3)",marginBottom:10}}>{filtered.length} өвчин</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {filtered.slice(0,isVip?999:isPrem?40:10).map((d,i)=>(
                <div key={i} className="glass dc">
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <div><span style={{fontSize:14,fontWeight:600,color:"var(--g)"}}>{d.name}</span><span style={{fontSize:11,color:"var(--t3)",marginLeft:6}}>{d.icon} {d.crop}</span></div>
                    <span className="sev" style={{background:sevMap[d.severity]?.bg,color:sevMap[d.severity]?.c}}>{sevMap[d.severity]?.l}</span>
                  </div>
                  <div style={{fontSize:11,color:"var(--t3)",fontStyle:"italic",marginBottom:5}}>{typeL[d.type]} • {d.pathogen}</div>
                  <p style={{fontSize:12,color:"var(--t2)",lineHeight:1.45,marginBottom:6}}>{d.symptoms}</p>
                  
                </div>
              ))}
              {!isVip&&filtered.length>(isPrem?40:10)&&(
                <div className="glass" style={{padding:20,textAlign:"center"}}>
                  <p style={{color:"var(--gold)",fontWeight:600,fontSize:14,marginBottom:8}}>Бүх {filtered.length} өвчин</p>
                  <button className="btn btn-gold" onClick={()=>setModal("pricing")}>Эрх авах</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════ HISTORY ══════ */}
        {tab==="history"&&(
          <div className="up">
            <div style={{marginBottom:14}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:"var(--g)"}}>📋 Оношлогооны түүх</h2><button className="btn btn-o" style={{padding:"5px 12px",fontSize:11}} onClick={()=>setTab("diagnose")}>← Буцах</button></div></div>
            {!user&&<div className="glass" style={{padding:24,textAlign:"center"}}><p style={{color:"var(--t3)",marginBottom:10}}>Нэвтрэнэ үү</p><button className="btn btn-g" onClick={()=>setModal("login")}>Нэвтрэх</button></div>}
            {user&&hist.length===0&&<div className="glass" style={{padding:24,textAlign:"center",color:"var(--t3)"}}>📷 Зургаа оруулаад эхлээрэй!</div>}
            {user&&hist.map((h,i)=>(
              <div key={i} className="glass dc" style={{marginBottom:8,display:"flex",gap:10}}>
                {h.thumb&&<img src={h.thumb} alt="" style={{width:48,height:48,objectFit:"cover",borderRadius:8,flexShrink:0}}/>}
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontWeight:600,color:"var(--g)",fontSize:13}}>{h.disease_name}</span>
                    {h.severity&&<span className="sev" style={{background:sevMap[h.severity]?.bg,color:sevMap[h.severity]?.c}}>{sevMap[h.severity]?.l}</span>}
                  </div>
                  <div style={{fontSize:11,color:"var(--t3)"}}>{h.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════ LOGIN ══════ */}
      {modal==="login"&&(
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="glass up" style={{padding:28,maxWidth:360,width:"100%"}} onClick={e=>e.stopPropagation()}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:"var(--g)",marginBottom:16,textAlign:"center"}}>Нэвтрэх</h2>
            {err&&<div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",borderRadius:8,padding:"6px 10px",marginBottom:10,fontSize:12,color:"var(--red)"}}>{err}</div>}
            <input className="inp" placeholder="Имэйл" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{marginBottom:8}}/>
            <input className="inp" type="password" placeholder="Нууц үг" value={form.pw} onChange={e=>setForm({...form,pw:e.target.value})} onKeyDown={e=>e.key==="Enter"&&login()} style={{marginBottom:12}}/>
            <button className="btn btn-g" style={{width:"100%"}} onClick={login}>Нэвтрэх</button>
            <p style={{textAlign:"center",marginTop:10,fontSize:12,color:"var(--t3)"}}>Шинэ? <span style={{color:"var(--g)",cursor:"pointer"}} onClick={()=>{setModal("register");setErr("");}}>Бүртгүүлэх</span></p>

          </div>
        </div>
      )}

      {/* ══════ REGISTER ══════ */}
      {modal==="register"&&(
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="glass up" style={{padding:28,maxWidth:360,width:"100%"}} onClick={e=>e.stopPropagation()}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:"var(--g)",marginBottom:16,textAlign:"center"}}>Бүртгүүлэх</h2>
            {err&&<div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",borderRadius:8,padding:"6px 10px",marginBottom:10,fontSize:12,color:"var(--red)"}}>{err}</div>}
            <input className="inp" placeholder="Нэр" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{marginBottom:8}}/>
            <input className="inp" placeholder="Имэйл" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{marginBottom:8}}/>
            <input className="inp" type="password" placeholder="Нууц үг (6+)" value={form.pw} onChange={e=>setForm({...form,pw:e.target.value})} onKeyDown={e=>e.key==="Enter"&&register()} style={{marginBottom:12}}/>
            <button className="btn btn-g" style={{width:"100%"}} onClick={register}>Бүртгүүлэх</button>
            <p style={{textAlign:"center",marginTop:10,fontSize:12,color:"var(--t3)"}}>Бүртгэлтэй? <span style={{color:"var(--g)",cursor:"pointer"}} onClick={()=>{setModal("login");setErr("");}}>Нэвтрэх</span></p>
          </div>
        </div>
      )}

      {/* ══════ PRICING ══════ */}
      {modal==="pricing"&&(
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="glass up" style={{padding:24,maxWidth:640,width:"100%",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:"var(--g)",textAlign:"center",marginBottom:18}}>Эрхийн төлөвлөгөө</h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {[
                {id:"free",icon:"🌱",name:"Үнэгүй",price:"₮0",color:"var(--g)",feats:["✅ Өдөрт 3 оношлогоо","✅ 10 өвчний лавлах","— AI дэлгэрэнгүй","— Микроскоп","— 24/7 зөвлөгөө"],badge:"ОДООГИЙН",isCurrent:!user?.tier||user?.tier==="free"},
                {id:"premium",icon:"⭐",name:"Premium",price:"₮59,900",sub:"/сар",color:"var(--gold)",feats:["✅ Хязгааргүй оношлогоо","✅ 40 өвчний лавлах","✅ AI дэлгэрэнгүй","✅ Дифференциал","— Микроскоп"],badge:user?.tier==="premium"?"ОДООГИЙН":"АЛДАРТАЙ",isCurrent:user?.tier==="premium",bg:"linear-gradient(135deg,#fbbf24,#f59e0b)",shadow:"0 0 20px rgba(251,191,36,.06)"},
                {id:"vip",icon:"💎",name:"VIP",price:"₮89,900",sub:"/сар",color:"var(--vip)",feats:["✅ Хязгааргүй оношлогоо","✅ 80+ өвчний лавлах","✅ AI нарийвчилсан","✅ Микроскоп зөвлөмж","✅ 24/7 мэргэжилтэн"],badge:user?.tier==="vip"?"ОДООГИЙН":"ШИЛДЭГ",isCurrent:user?.tier==="vip",bg:"linear-gradient(135deg,#a78bfa,#7c3aed)",shadow:"0 0 20px rgba(124,58,237,.08)"}
              ].map(p=>(
                <div key={p.id} style={{borderRadius:14,padding:16,background:p.id==="vip"?"linear-gradient(180deg,rgba(124,58,237,.06),var(--bg2))":"var(--bg2)",border:"2px solid "+(p.isCurrent?p.color:"var(--border)"),position:"relative",boxShadow:p.shadow||"none"}}>
                  <div style={{position:"absolute",top:-9,left:"50%",transform:"translateX(-50%)",background:p.bg||"var(--g3)",color:p.bg?"#fff":"#fff",fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:8,whiteSpace:"nowrap"}}>{p.badge}</div>
                  <div style={{textAlign:"center",marginBottom:12}}>
                    <div style={{fontSize:24}}>{p.icon}</div>
                    <div style={{fontSize:14,fontWeight:700,color:p.color}}>{p.name}</div>
                    <div style={{fontSize:22,fontWeight:800,color:p.color,marginTop:4}}>{p.price}{p.sub&&<span style={{fontSize:10,fontWeight:400,color:"var(--t3)"}}>{p.sub}</span>}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:14,fontSize:11}}>
                    {p.feats.map((f,fi)=><div key={fi} style={{color:f.startsWith("✅")?p.id==="vip"?"#e0d4ff":"var(--t)":"var(--t3)"}}>{f}</div>)}
                  </div>
                  {p.isCurrent?<button className="btn btn-o" disabled style={{width:"100%",fontSize:11,padding:7,opacity:.5}}>Одоогийн</button>
                    :p.id==="free"?null
                    :<button className="btn" style={{width:"100%",fontSize:12,padding:8,background:p.bg||"var(--g3)",color:p.id==="premium"?"#000":"#fff",fontWeight:700}} onClick={()=>upgrade(p.id)}>{p.icon} {p.name}</button>}
                </div>
              ))}
            </div>
            <button className="btn btn-o" style={{width:"100%",marginTop:12}} onClick={()=>setModal(null)}>Хаах</button>
          </div>
        </div>
      )}
    </div>
  );
}
