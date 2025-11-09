Jestes architektem programowania w react.
Przygotuj PLAN (jeszcze bez implementacji) do stworzenia aplikacji webowej go generowania kolorwanego na podstawie promptu AI. Ma meic przyciks ktory nasluchje mowe i wysyla do open AI. nastepnie gdy zmeini tekst na mowe to wysyla do AI jako prompt do generowani kolorowanki. Aplikacja odbierze obraz to wyysla ja do drukarki online brother 192.168.1.188 i drukuje ta ssztuke

## Aplikacja
* Na środku ma być wielki przycisk z ikoną mikrofonu
    * Gdy nacisnie si emikrofon to pojawi sie ikona stop do zatrzymania z jednej storny na zielono
    * Z drugiej storny ikona kosza do usuneicia i anulowania
* GDy skonczy sie nagrywanie to aplikacja wysyła do API open AI nagrana wiadomosc aby zamienic ja na tekst
* Gdy dostaneimy odpowiedz to ponizej wypisz ten tekst i od razu wyslij kolejny call do API open AI do wygenerowania obrazu
* Gdy obraz sie wygeneruje to pojawi sie on na ekranie i jednczensie wyslany jest call do drugkarki brother 192.168.1.188 aby ja wydrukowac. Gdy to sie skonczy pojawi sie odpowiedni komunikat
* Samo generowanie ma byc w wielkim modalu 
* po lewej w pasku maja pojawic sie obrazki z wydrukowanymi kolorowankami. Gdy sie na nie kliknie ot pojaiw si emodal z promtem i ikona do druku aby mozna ja bylo wydrukowac jeszcze raz



WYmaganai technicze:
* Zrób to prosto - apliakcja ma byc dla dzieci ale nowoczesna
* Ma byc napisana w react js
* Przechowuj wszystkie pliki (kolorowanki i nagrane wiadomosci)
* Kazda kolorowanka do osobny folder z nazwa jako timestamp
    * w folderze ma byc plik z kolorowanka, plik z promptem 
  - Transkrypcja audio (OpenAI Whisper) - opis api w speach-to-text.txt
  - Generowanie obrazu (OpenAI ) - opis API w image-generator.txt

Ma to byc prosta apliakcja. Mozemy zrobic to bez server? Nie chce wystawic swojego API. Przemysl architekture ktora by go nie wymagała, a historie wygenerowanych kolorowaneg porpsotu zapisuj gdzies obok w folderze
