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

**Figure:** 265ghz-reflectarray-slide.jpg

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

**Current description:**

As digital systems scale to deliver hundreds of gigabits per second
between chips, between racks, and between cryogenic and
room-temperature stages of quantum machines, the interconnect has
become the bottleneck — copper traces lose signal at higher
frequencies, and adding more parallel lanes burns area and power.
The sub-terahertz band opens a clean path: wavelengths near 1 mm fit
on a chip, can be steered with on-die antennas, and propagate
efficiently through plastic dielectric waveguides without the
electrical loss and return-current management of conventional metal
lines. We build the integrated circuits that close those links. Our
CMOS and SiGe chips drive 105 Gbps over a single dielectric
waveguide, transmit and detect orbital-angular-momentum modes to
spatially multiplex channels at 0.31 THz, sustain in-band full-duplex
operation from 300 K down to 4.2 K, and integrate microwatt-class
wake-up receivers so always-on links don't drain the battery.

**Representative publications:**
- wang2025bidirectional
- lee2024264
- lee202354mm
- khan2022thz
- khan202131thz
- holloway2021105gbps
- yi2021realization
- holloway2017fully

**Figures to include:** OAM transceiver chip, dielectric waveguide link
demonstration, wake-up receiver photos.

---

## 3. THz Spectroscopy and Molecular Clocks

**Tag:** `molecular-atomic`, `frequency-synthesis`

**Figure:** molecular-clock-slide.jpg

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
- wang2018chip
- kim2022sub
- wang2021terahertz
- wang2020sub
- wang2019chip
- wang2017rapid
- wang2017dual
- yi2021sub
- han2013cmos

**Figures to include:** molecular clock spectrum, NV-center magnetometer
chip, dual-comb spectrometer.

---

## 4. Hardware Security

**Tag:** `security`

**Current description:**

As chips spread into every supply chain, payment terminal, and
connected device, the attack surface has moved from the algorithm to
the silicon itself — counterfeit components, tampered packages,
side-channel leakage, and physical replay all bypass conventional
cryptography. We exploit sub-terahertz waves to push security down to
the physics layer. Wavelengths near 1 mm interact with chip-scale
features in ways too small to clone, sense, or substitute:
package-less identification tags use backscatter at 260 GHz for
unforgeable authentication, anti-tampering tags read unclonable
scattering signatures at the chip-item interface, and
orbital-angular-momentum modes carry signals with inherent
eavesdropping resistance. Beyond crypto, the chip itself becomes the
root of trust.

**Representative publications:**
- lee2024antitampering
- lee2026self
- jia2025retro
- lee2024264
- khan2022thz
- woo2022physical
- khan2021cmos
- ibrahim2020thzid

**Figures to include:** THz-ID chip, packageless anti-tamper backscatter
demonstration, cryptographic wake-up receiver.

---

## 5. Quantum Information and Sensing

**Tag:** `quantum`

**Current description:**

Scaling quantum computers from today's tens of qubits to the millions
required for error-corrected machines is increasingly a classical
hardware problem: how to control, read out, and connect quantum
processors at cryogenic temperatures without flooding the system with
heat or wires. We bring silicon CMOS to that interface. Our chips
integrate scalable quantum magnetometers based on diamond
nitrogen-vacancy centers, cryo-CMOS controllers that drive
color-center qubits at 4 K, and wireless terahertz datalinks that
replace coaxial cables between cold quantum processors and
room-temperature classical control — approaching the fundamental
thermodynamic limit of information transfer in the process.

**Representative publications:**
- wang2026cryo
- wang2025bidirectional
- wang2024cmos
- anders2023cmos
- wang2023thzcryo
- li2022scalable
- ibrahim2021high
- ibrahim2019scalable
- trusheim2019cmos

**Figures to include:** cryo-CMOS color-center quantum controller chip,
bidirectional THz cryogenic datalink, CMOS-integrated NV-center
magnetometer array.
