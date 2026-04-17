export type Office = {
  name: string;
  address: string;
  email: string;
  phone: string;
  area: string;
};

export const CONSUMER_OFFICES: Office[] = [
  { name: 'Budapest Főváros Kormányhivatala Fogyasztóvédelmi Főosztály', address: '1117 Budapest, Prielle Kornélia utca 4/b.', email: 'fogyasztovedelem@bfkh.gov.hu', phone: '(1) 450-2598', area: 'Budapest főváros területe' },
  { name: 'Pest Vármegyei Kormányhivatal Fogyasztóvédelmi Főosztály', address: '1072 Budapest, Nagy Diófa u. 10-12.', email: 'fogyved@pest.gov.hu', phone: '06 1 459 4843', area: 'Pest vármegye' },
  { name: 'Bács-Kiskun Vármegyei Kormányhivatal Fogyasztóvédelmi Osztály', address: '6000 Kecskemét, Szent István krt. 19/A.', email: 'fogyasztovedelem@bacs.gov.hu', phone: '06 76 795 710', area: 'Bács-Kiskun vármegye' },
  { name: 'Baranya Vármegyei Kormányhivatal Fogyasztóvédelmi Osztály', address: '7630 Pécs, Hengermalom u. 2.', email: 'fogyasztovedelem@baranya.gov.hu', phone: '06 72 795 398', area: 'Baranya vármegye' },
  { name: 'Békés Vármegyei Kormányhivatal Fogyasztóvédelmi Osztály', address: '5600 Békéscsaba, József Attila u. 2-4.', email: 'fogyved@bekes.gov.hu', phone: '+36 66 546 150', area: 'Békés vármegye' },
  { name: 'Borsod-Abaúj-Zemplén Vármegyei Kormányhivatal Fogyasztóvédelmi Osztály', address: '3527 Miskolc, József Attila u. 20.', email: 'fogyasztovedelem@borsod.gov.hu', phone: '06 46 795 779', area: 'Borsod-Abaúj-Zemplén vármegye' },
  { name: 'Csongrád-Csanád Vármegyei Kormányhivatal Fogyasztóvédelmi Osztály', address: '6722 Szeged, Rákóczi tér 1.', email: 'fogyasztovedelem@csongrad.gov.hu', phone: '06 62 680 532', area: 'Csongrád-Csanád vármegye' },
  { name: 'Fejér Vármegyei Kormányhivatal Fogyasztóvédelmi Osztály', address: '8000 Székesfehérvár, Honvéd utca 8.', email: 'fogyved@fejer.gov.hu', phone: '+36 22 501 751', area: 'Fejér vármegye' },
  { name: 'Győr-Moson-Sopron Vármegyei Kormányhivatal Fogyasztóvédelmi Osztály', address: '9022 Győr, Türr István utca 7.', email: 'fogyasztovedelem@gyor.gov.hu', phone: '+36 96 795 950', area: 'Győr-Moson-Sopron vármegye' },
  { name: 'Hajdú-Bihar Vármegyei Kormányhivatal Fogyasztóvédelmi Osztály', address: '4025 Debrecen, Széchenyi utca 46.', email: 'fogyasztovedelem@hajdu.gov.hu', phone: '06 52 533 924', area: 'Hajdú-Bihar vármegye' },
  { name: 'Heves Vármegyei Kormányhivatal Fogyasztóvédelmi Osztály', address: '3300 Eger, Kossuth L. u. 9.', email: 'fogyved@heves.gov.hu', phone: '06 (36) 515-469', area: 'Heves vármegye' },
  { name: 'Jász-Nagykun-Szolnok Vármegyei Kormányhivatal Fogyasztóvédelmi Osztály', address: '5000 Szolnok, Indóház u. 8.', email: 'jasz.fogyved@jasz.gov.hu', phone: '56/795-165', area: 'Jász-Nagykun-Szolnok vármegye' },
  { name: 'Komárom-Esztergom Vármegyei Kormányhivatal Fogyasztóvédelmi Osztály', address: '2800 Tatabánya, Bárdos László utca 2.', email: 'fogyasztovedelem.meff@komarom.gov.hu', phone: '(34) 309-303', area: 'Komárom-Esztergom vármegye' },
  { name: 'Nógrád Vármegyei Kormányhivatal Fogyasztóvédelmi Osztály', address: '3100 Salgótarján, Karancs út 54.', email: 'fogyved@nograd.gov.hu', phone: '06 32 511 116', area: 'Nógrád vármegye' },
  { name: 'Somogy Vármegyei Kormányhivatal Fogyasztóvédelmi Osztály', address: '7400 Kaposvár, Vásártéri út 2.', email: 'fogyasztovedelem@somogy.gov.hu', phone: '06 82 510 868', area: 'Somogy vármegye' },
  { name: 'Szabolcs-Szatmár-Bereg Vármegyei Kormányhivatal Fogyasztóvédelmi Osztály', address: '4400 Nyíregyháza, Hatzel tér 10.', email: 'fogyasztovedelem@szabolcs.gov.hu', phone: '06 42 500 694', area: 'Szabolcs-Szatmár-Bereg vármegye' },
  { name: 'Tolna Vármegyei Kormányhivatal Fogyasztóvédelmi Osztály', address: '7100 Szekszárd, Kiskorzó tér 3.', email: 'fogyasztovedelem@tolna.gov.hu', phone: '(74) 795-385', area: 'Tolna vármegye' },
  { name: 'Vas Vármegyei Kormányhivatal Fogyasztóvédelmi Osztály', address: '9700 Szombathely, Wesselényi u. 7.', email: 'fogyasztovedelem@vas.gov.hu', phone: '+36/70-705-1435', area: 'Vas vármegye' },
  { name: 'Veszprém Vármegyei Kormányhivatal Fogyasztóvédelmi Osztály', address: '8200 Veszprém, Kistó utca 1.', email: 'fogyasztovedelem@veszprem.gov.hu', phone: '+36 88 550 510', area: 'Veszprém vármegye' },
  { name: 'Zala Vármegyei Kormányhivatal Fogyasztóvédelmi Osztály', address: '8900 Zalaegerszeg, Pintér Máté u. 22.', email: 'fogyasztovedelem.zala@zala.gov.hu', phone: '+36 92 510 530', area: 'Zala vármegye' },
];

export type Board = {
  name: string;
  seat: string;
  area: string;
  address: string;
  phone: string;
  email: string;
  web: string;
};

export const CONCILIATION_BOARDS: Board[] = [
  { name: 'Budapesti Békéltető Testület', seat: 'Budapest', area: 'Budapest', address: '1016 Budapest, Krisztina krt. 99. I. em. 111.', phone: '06-1-488-2131', email: 'bekelteto.testulet@bkik.hu', web: 'bekeltet.bkik.hu' },
  { name: 'Baranya Vármegyei Békéltető Testület', seat: 'Pécs', area: 'Baranya, Somogy, Tolna vármegye', address: '7625 Pécs, Majorossy I. u. 36.', phone: '06-72-507-154', email: 'info@baranyabekeltetes.hu', web: 'baranyabekeltetes.hu' },
  { name: 'Borsod-Abaúj-Zemplén Vármegyei Békéltető Testület', seat: 'Miskolc', area: 'Borsod-Abaúj-Zemplén, Heves, Nógrád vármegye', address: '3525 Miskolc, Szentpáli u. 1.', phone: '06-46-501-091', email: 'bekeltetes@bokik.hu', web: 'bekeltetes.borsodmegye.hu' },
  { name: 'Csongrád-Csanád Vármegyei Békéltető Testület', seat: 'Szeged', area: 'Békés, Bács-Kiskun, Csongrád-Csanád vármegye', address: '6721 Szeged, Párizsi krt. 8-12.', phone: '06-62/549-392', email: 'bekelteto.testulet@cskik.hu', web: 'bekeltetes-csongrad.hu' },
  { name: 'Fejér Vármegyei Békéltető Testület', seat: 'Székesfehérvár', area: 'Fejér, Komárom-Esztergom, Veszprém vármegye', address: '8000 Székesfehérvár, Hosszúsétatér 4-6.', phone: '06-22-510-310', email: 'bekeltetes@fmkik.hu', web: 'www.bekeltetesfejer.hu' },
  { name: 'Győr-Moson-Sopron Vármegyei Békéltető Testület', seat: 'Győr', area: 'Győr-Moson-Sopron, Vas, Zala vármegye', address: '9022 Győr, Szent István út 10/a.', phone: '06-96-520-217', email: 'bekelteto.testulet@gymsmkik.hu', web: 'bekeltetesgyor.hu' },
  { name: 'Hajdú-Bihar Vármegyei Békéltető Testület', seat: 'Debrecen', area: 'Jász-Nagykun-Szolnok, Hajdú-Bihar, Szabolcs-Szatmár-Bereg vármegye', address: '4025 Debrecen, Vörösmarty u. 13-15.', phone: '06-52-500-710', email: 'bekelteto@hbkik.hu', web: 'hbmbekeltetes.hu' },
  { name: 'Pest Vármegyei Békéltető Testület', seat: 'Budapest', area: 'Pest vármegye', address: '1055 Budapest, Balassi Bálint u. 25. IV/2.', phone: '06-1-792-7881', email: 'pmbekelteto@pmkik.hu', web: 'panaszrendezes.hu' },
];
