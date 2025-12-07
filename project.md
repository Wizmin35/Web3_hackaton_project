# GlamBook – Web3 Booking Platform

## Opis aplikacije

GlamBook je decentralizirana platforma za rezervaciju frizerskih i kozmetičkih usluga, izgrađena na Solana blockchainu. Korisnicima omogućuje jednostavno rezerviranje šišanja, manikure, pedikure, stylinga, bojanja i drugih usluga, uz plaćanje u kriptovaluti **SOL** putem **Phantom walleta**.

Platforma koristi smart contracte za automatsko upravljanje plaćanjima, povratima i provizijama, čime osigurava sigurnost, transparentnost i potpunu automatizaciju svih transakcija.

---

## Kako aplikacija radi

Aplikacija se sastoji od tri glavna dijela:

### 1. Frontend (Next.js 14)

Frontend omogućava korisnicima:

- pregled usluga po kategorijama (Šišanje, Nokti, Styling, Bojanje)
- odabir salona i željenih usluga
- odabir termina i rezervaciju
- autentifikaciju putem Phantom walleta (bez klasičnih korisničkih računa)

### 2. Backend API (Node.js + Express)

Backend je zadužen za:

- poslovnu logiku aplikacije
- pohranu salona, usluga i rezervacija u bazu podataka
- komunikaciju sa Solana blockchainom i izvršavanje transakcija

### 3. Solana Smart Contract (Rust + Anchor)

Smart contract upravlja financijskim procesima:

- zaključava sredstva korisnika u escrow prilikom rezervacije  
- oslobađa sredstva salonu nakon završetka usluge  
- automatski obrađuje povrate prema pravilima otkazivanja  
- zadržava proviziju platforme

---

## Rješavanje rezervacija i otkazivanja

GlamBook koristi escrow sustav kako bi eliminirao nesigurnosti i sporove između korisnika i salona.

### Prilikom rezervacije

Korisnik plaća cijenu usluge u SOL-u.  
Sredstva se zaključavaju u escrow računu dok se usluga ne završi ili otkaže.

Ovaj sustav:

- osigurava salonu sigurno plaćanje  
- korisniku daje garanciju povrata  
- eliminira potrebu za posrednikom

---

## Pravila otkazivanja (programirana u smart contractu)

### ➤ Otkazivanje više od **48 sati** prije termina
- 100% povrat korisniku  
- salon ne dobiva naknadu  
- nema provizije platforme

### ➤ Otkazivanje **24–48 sati** prije termina
- 80% povrat korisniku  
- salon dobiva 2 €  
- platforma uzima 3% provizije od salonove naknade

### ➤ Otkazivanje **manje od 24 sata** prije termina
- 50% povrat korisniku  
- salon dobiva 5 €  
- platforma uzima proviziju

### ➤ No-show (korisnik se ne pojavi)
- korisnik ne dobiva povrat  
- salon dobiva cijeli iznos (umanjen za 3% provizije platforme)

---

## Automatska obrada i transparentnost

Smart contract automatski:

- izračunava povrate, naknade i provizije  
- izvršava prijenose sredstava  
- bilježi sve transakcije na blockchainu  
- eliminira ljudske pogreške i ručnu obradu

Kada salon označi uslugu kao završenu, sredstva se automatski isplaćuju salonu uz proviziju platforme od 3%.

---

## Prednosti sustava

- **Bez posrednika** — automatizacija preko smart contracta  
- **Transparentnost** — sve je zapisano na blockchainu  
- **Brze i jeftine transakcije** (Solana)  
- **Smanjeni sporovi** — pravila su fiksna i javna  
- **Visoka sigurnost** — escrow sustav štiti obje strane

---
