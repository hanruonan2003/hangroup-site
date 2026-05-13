# Research Thrusts

The group works across four broad thrusts. Each can be updated independently;
each one's `representative_publications` field lists the BibTeX citation keys
from publications.bib that the build script should surface on the page.

> NOTE: The descriptions below are from the original WordPress page, which
> was last updated in 2019 (the page's modified-time meta tag still reads
> `2019-06-20`). They should be rewritten to reflect 2020–2026 work — in
> particular the 265 GHz reflectarray, 140 GHz monostatic radar, OAM
> transceiver, THz-ID, and anti-tampering tag.

---

## 1. Imaging and Radar

**Tag:** `imaging-radar`

**Current description:**

A radar that fits on a credit card, sees through fog, and resolves
millimeter-scale features at automotive distances would change how
machines perceive the world. LiDAR is precise but fails in degraded
weather; microwave radar is robust but bulky. The sub-terahertz band
sits at the sweet spot — short enough wavelengths for compact apertures,
long enough for atmospheric transparency. Realizing it in silicon CMOS
requires solving three coupled problems: pushing chirp bandwidth near
the transistor cutoff, duplexing TX and RX without inherent loss, and
steering the beam across a wide field of view without mechanical
scanning.

**Representative publications:**
- chen2026234
- chen2024265
- monroe2022electronic
- chen2022140
- chen2022140ghz
- yi2021220
- yi2020isscc
- han2015sige
- han2013active

**Figures to include:** chip photos and field plots from the 265 GHz
reflectarray (most visually striking project), the 140 GHz monostatic
radar, and the FMCW comb radar.

---

## 2. THz Communication and Interconnect

**Tag:** `communication`, `interconnect`

**Current description (NEEDS REWRITE):**

Wireless and wired communication at sub-THz frequencies using novel
modulation schemes (OAM), dielectric waveguides, and integrated
antennas — pushing toward 100+ Gbps per link.

**Representative publications:**
- khan2021oam_rfic
- khan2021oam_jssc
- holloway2021link
- yi2020fullduplex
- lee2024wakeup

**Figures to include:** OAM transceiver chip, dielectric waveguide link
demonstration, wake-up receiver photos.

---

## 3. THz Spectroscopy and Molecular Clocks

**Tag:** `molecular-atomic`, `frequency-synthesis`

**Current description:**

Polar molecules have rotational transitions in the sub-terahertz band
that are sharp, immune to environmental perturbation, and identical for
every molecule of a given species anywhere in the universe — making
them ideal references for both precision timekeeping and chemical
identification. Today's atomic clocks and laboratory spectrometers
exploit this physics but require benchtop instruments. We build the
same capability into silicon. By integrating broadband sub-THz sources,
high-harmonic interrogation, and frequency-comb spectrometers on CMOS,
our chips lock to molecular rotational lines for atomic-clock-grade
timing, and scan hundreds of GHz of bandwidth to identify trace gases
— bringing molecular spectroscopy to chip scale.

**Representative publications:**
- kim2022sub
- wang2021terahertz
- wang2020sub
- wang2019chip
- wang2018chip
- wang2017rapid
- wang2017dual
- yi2021sub
- han2013cmos

**Figures to include:** molecular clock spectrum, NV-center magnetometer
chip, dual-comb spectrometer.

---

## 4. Hardware Security and Tags

**Tag:** `security`

**Current description (NEEDS REWRITE):**

Package-less, chip-scale identification and authentication tags
operating in the sub-THz band — combining backscatter communication,
asymmetric cryptography, and physically unclonable interface scattering.

**Representative publications:**
- khan2020thzid
- thzid_isscc_2020
- lee2024antitamper
- lee2024wakeup

**Figures to include:** THz-ID chip, packageless anti-tamper backscatter
demonstration, cryptographic wake-up receiver.
