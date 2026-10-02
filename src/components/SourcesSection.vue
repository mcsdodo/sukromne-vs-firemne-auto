<template>
  <section class="sources">
    <h2>Zdôvodnenie a zdroje</h2>
    <p class="intro">
      Prečo každý stĺpec počíta tak, ako počíta. Stav podľa zákonov platných v roku 2026.
      Kalkulačka je zjednodušený model, nie daňové poradenstvo.
    </p>

    <div class="blocks">
      <div class="block">
        <h3>Súkromné auto</h3>
        <ul>
          <li>Auto kupuje majiteľ zo svojich peňazí (z dividend). Firma mu za služobné jazdy platí cestovné náhrady.</li>
          <li>
            Náhrada = základná náhrada {{ kmRateText }} €/km + náhrada za
            {{ isEv ? 'spotrebovanú elektrinu' : 'spotrebované palivo' }}
            (spotreba z technického preukazu +10%, cena z dokladu).
            <a :href="L.cestovne">§ 7 zákona č. 283/2002 Z. z.</a>,
            <a :href="L.nipSadzba">sadzba 2026 (NIP)</a>
          </li>
          <li v-if="isEv">
            Pri elektromobile sa spotreba z osvedčenia o evidencii zvyšuje o 10% a cena je z faktúry za
            elektrinu pre domácnosť alebo z dokladu z nabíjačky.
            <a :href="L.cestovne">§ 7 ods. 5 a ods. 6 písm. e) zákona č. 283/2002 Z. z.</a>
          </li>
          <li>
            Pre majiteľa náhrada nie je predmetom dane, pre firmu je daňový výdavok.
            <a :href="L.zdp">§ 5 ods. 5 písm. a) a § 19 ods. 2 písm. d) ZDP</a>
          </li>
          <li>Pri predaji dostane majiteľ celú predajnú cenu, bez DPH a dane.</li>
        </ul>
      </div>

      <div class="block">
        <h3>Firemné auto (100%)</h3>
        <ul>
          <li>
            Firma vedie elektronickú knihu jázd, ktorá preukazuje výlučne podnikateľské použitie. Preto si odpočíta
            100% DPH z kúpy aj z prevádzky.
            <a :href="L.dph">§ 85n zákona č. 222/2004 Z. z.</a>,
            <a :href="L.fsDph">FS 3/DPH/2025/MU</a>
          </li>
          <li>
            Odpisy z ceny bez DPH počas {{ depText }}
            <span v-if="depreciationYears === 2">(odpisová skupina 0 pre BEV a PHEV)</span><span v-else-if="depreciationYears === 4">(odpisová skupina 1)</span>.
            <a :href="L.zdp">§ 26 a príloha č. 1 ZDP</a>
          </li>
          <li>Všetky náklady na auto sú daňový výdavok v plnej výške.</li>
          <li v-if="isEv">
            DPH z domáceho nabíjania si firma neodpočíta, lebo faktúra za elektrinu nie je na firmu.
            Náhrada za domáce nabíjanie je však daňový výdavok.
            <a :href="L.dph">§ 51 ods. 1 písm. a) zákona o DPH</a>,
            <a :href="L.fsElektro">FS 13/PO/2022/IM</a>
          </li>
          <li>Pri predaji firma odvedie DPH, zaplatí daň z príjmu a zvyšok vyplatí ako dividendu.</li>
        </ul>
      </div>

      <div class="block">
        <h3>Paušál (50% DPH / 80% daň)</h3>
        <ul>
          <li>
            Auto sa používa aj súkromne a firma nevedie knihu jázd. Od 1.1.2026 do 30.6.2028 si odpočíta len 50% DPH
            z kúpy aj z prevádzky.
            <a :href="L.dph">§ 85n zákona o DPH</a>,
            <a :href="L.fsDph">FS 3/DPH/2025/MU</a>
          </li>
          <li>
            Neodpočítaných 50% DPH nie je daňový výdavok a nie je súčasťou daňovej vstupnej ceny. Odpisy a náklady
            sa preto počítajú z cien bez DPH.
            <a :href="L.zdp">§ 52zzzk ZDP</a>,
            <a :href="L.fs45">FS 45/DZPaU/2025/MU, príklad 1 a 3</a>
          </li>
          <li>
            Odpisy, poistenie a údržba sú daňový výdavok len na 80% (paušál), bez ohľadu na skutočný podiel
            súkromných jázd.
            <a :href="L.zdp">§ 19 ods. 2 písm. t) ZDP</a>,
            <a :href="L.fs523850">FS: paušálne výdavky na majetok osobnej potreby</a>
          </li>
          <li>
            {{ isEv ? 'Elektrina' : 'Palivo' }} je samostatný paušál 80% pre pohonné látky.
            <span v-if="isEv">Elektrina sa posudzuje ako pohonná látka.</span>{{ ' ' }}
            <a :href="L.zdp">§ 19 ods. 2 písm. l) ZDP</a><span v-if="isEv">,
            <a :href="L.fsElektro">FS 13/PO/2022/IM</a></span>
          </li>
          <li>
            Pri predaji do 5 rokov firma dostane späť časť neodpočítanej DPH z kúpy (úprava odpočtu).
            <a :href="L.dph">§ 54 zákona o DPH</a>
          </li>
        </ul>
      </div>

      <div class="block">
        <h3>Paušál (50% DPH / 100% daň + {{ rateText }})</h3>
        <ul>
          <li>
            Firma dá auto konateľovi aj na súkromné použitie a zdaní mu nepeňažný príjem {{ rateText }} zo vstupnej
            ceny s DPH za každý mesiac. Základ klesá o 12,5% ročne, najviac 8 rokov.
            <span v-if="isEv">Pre odpisovú skupinu 0 je sadzba 0,5%.</span>{{ ' ' }}
            <a :href="L.zdp">§ 5 ods. 3 písm. a) ZDP</a>,
            <a :href="L.fs573977">FS: poskytnutie vozidla (otázka 1, 5, 7)</a>
          </li>
          <li>
            Ak firma zdaní nepeňažný príjem, nepostupuje podľa § 19 ods. 2 písm. t). Odpisy, poistenie a údržba
            sú daňový výdavok na 100%.
            <a :href="L.fs523850">FS: paušálne výdavky, otázka 5</a>
          </li>
          <li>
            {{ isEv ? 'Elektrina' : 'Palivo' }} zostáva na 80% paušále pre pohonné látky.
            <a :href="L.fs523850">FS: paušálne výdavky, otázka 5</a>
          </li>
          <li>DPH zostáva na 50%, ako v stĺpci Paušál 50/80.</li>
          <li>
            Konateľ bez mzdy si daň z nepeňažného príjmu vysporiada v daňovom priznaní. Kalkulačka počíta len
            daň z príjmu, bez odvodov.
            <a :href="L.fs573977">FS: poskytnutie vozidla, otázka 7</a>
          </li>
          <li>
            Podľa praxe je to voľba firmy: bez zdanenia nepeňažného príjmu firma kráti výdavky podľa
            § 19 ods. 2 písm. t).
            <a :href="L.podnikajte">Podnikajte.sk: konateľ a majetok firmy</a>.
            FS formuluje nepeňažný príjem konateľa prísnejšie, preto kalkulačka ukazuje obe možnosti.
            <a :href="L.fs573977">FS: poskytnutie vozidla, otázka 5</a>
          </li>
        </ul>
      </div>
    </div>

    <div class="block common">
      <h3>Spoločné predpoklady</h3>
      <ul>
        <li>Majiteľ je konateľ bez mzdy. Zisk firmy vyberá ako dividendy (daň z dividend {{ divText }}).</li>
        <li>Daň z príjmu firmy: 10% pri príjmoch do 100 000 €, inak 21% (dá sa zmeniť v pokročilých nastaveniach).</li>
        <li>Súkromné jazdy sú najviac 20% (inak by sa pohonné látky krátili viac ako na 80%).</li>
        <li>Cena auta pod 48 000 € daňovej vstupnej ceny alebo dostatočný základ dane (inak úprava podľa § 17 ods. 34 ZDP).</li>
        <li>Daň z motorových vozidiel sa nepočíta<span v-if="isEv"> (pre BEV je sadzba 0 €)</span>.</li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isEv: { type: Number, default: 0 },
  kmRate: { type: Number, required: true },
  depreciationYears: { type: Number, required: true },
  dividendTax: { type: Number, required: true }
})

const L = {
  zdp: 'https://static.slov-lex.sk/static/SK/ZZ/2003/595/20260101.html',
  dph: 'https://static.slov-lex.sk/static/SK/ZZ/2004/222/20260101.html',
  cestovne: 'https://static.slov-lex.sk/static/SK/ZZ/2002/283/20251101.html',
  nipSadzba: 'https://www.ip.gov.sk/aktuality/sumy-zakladnej-nahrady-za-pouzivanie-motorovych-vozidiel-pri-pracovnych-cestach-od-1-januara-2026.html',
  fsDph: 'https://www.financnasprava.sk/_img/pfsedit/Dokumenty_PFS/Zverejnovanie_dok/Dane/Metodicke_usmernenia/Nepriame_dane/2025/2025.12.19_003_DPH_2025_MU_OMV.pdf',
  fs45: 'https://www.financnasprava.sk/_img/pfsedit/Dokumenty_PFS/Zverejnovanie_dok/Dane/Metodicke_usmernenia/Priame_dane/2025/2025.12.19_45_DZPaU_2025_MU.pdf',
  fsElektro: 'https://www.financnasprava.sk/_img/pfsedit/Dokumenty_PFS/Zverejnovanie_dok/Aktualne/DP/DPPO/2022/2022.11.30_13_PO_2022_IM.pdf',
  fs523850: 'https://podpora.financnasprava.sk/523850-Uplat%C5%88ovanie-pau%C5%A1%C3%A1lnych-v%C3%BDdavkov-na-majetok-osobnej-potreby',
  fs573977: 'https://podpora.financnasprava.sk/573977-Poskytnutie-vozidla-',
  podnikajte: 'https://www.podnikajte.sk/dan-z-prijmov/konatel-spolocnik-a-pouzivanie-majetku-firmy-z-danoveho-hladiska'
}

const rateText = computed(() => props.isEv ? '0,5%' : '1%')
const kmRateText = computed(() => String(props.kmRate).replace('.', ','))
const depText = computed(() => props.depreciationYears === 2 ? '2 rokov' : `${props.depreciationYears} rokov`)
const divText = computed(() => `${Math.round(props.dividendTax * 100)}%`)
</script>

<style scoped>
.sources {
  margin-top: 40px;
}

.sources h2 {
  color: #f1f5f9;
  font-size: 20px;
  margin: 0 0 8px 0;
}

.intro {
  color: #94a3b8;
  font-size: 14px;
  margin: 0 0 16px 0;
}

.blocks {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

@media (max-width: 800px) {
  .blocks {
    grid-template-columns: minmax(0, 1fr);
  }
}

.block {
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 16px 20px;
}

.block h3 {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #f1f5f9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.block ul {
  margin: 0;
  padding-left: 18px;
  color: #cbd5e1;
  font-size: 13px;
  line-height: 1.55;
}

.block li + li {
  margin-top: 6px;
}

.block a {
  color: #60a5fa;
  text-decoration: none;
  white-space: nowrap;
}

.block a:hover {
  text-decoration: underline;
}
</style>
