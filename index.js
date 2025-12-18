// 2025.12.18
// Moxon.v.1.1

// Set UTF-8 encoding for Windows console
if (process.platform === 'win32') {
  const { execSync } = require('child_process');
  try {
    execSync('chcp 65001', { stdio: 'ignore' });
  } catch (e) {}
  if (process.stdout.setDefaultEncoding) {
    process.stdout.setDefaultEncoding('utf8');
  }
}

const rl = require('readline-sync');

// === Helper Converters ===
function awgToMm(awg) {
  return 0.127 * Math.pow(92, (36 - awg) / 39);
}

function mmToInch(mm) {
  return mm / 25.4;
}

function inchToMm(inch) {
  return inch * 25.4;
}

function mmToCrossSection(diameter) {
  // Area = pi * r^2
  return Math.PI * Math.pow(diameter / 2, 2);
}

function askNumber(prompt) {
  const value = parseFloat(rl.question(prompt));
  if (Number.isNaN(value)) {
    console.error('Error: Expected a number.');
    process.exit(1);
  }
  return value;
}

/**
 * Shortening factor (k) calculation
 * Based on the ratio of wavelength to diameter (M = lambda/d)
 */
function getShorteningFactor(fMHz, d_mm) {
  const lambda_mm = 299792 / fMHz;
  const M = lambda_mm / d_mm;
  
  if (M <= 2) return 0.9; 
  return 1 - (0.025 / Math.log10(M));
}

// === INPUT ===
const fMHz = askNumber('Enter frequency (MHz): ');
if (fMHz <= 0) {
  console.error('Frequency must be a positive number.');
  process.exit(1);
}

console.log('\nChoose conductor diameter input format:');
console.log('1 - Millimeters (mm)');
console.log('2 - Inches (in)');
console.log('3 - AWG');
const dMode = rl.question('Your choice (1/2/3): ');

let d_mm;
if (dMode === '1') {
  d_mm = askNumber('Enter diameter (mm): ');
} else if (dMode === '2') {
  d_mm = inchToMm(askNumber('Enter diameter (inches): '));
} else if (dMode === '3') {
  const awg = parseInt(rl.question('Enter AWG number: '), 10);
  d_mm = awgToMm(awg);
} else {
  console.error('Invalid choice.');
  process.exit(1);
}

const outMode = rl.question('\nOutput units (1 - mm [default], 2 - inches): ') || '1';

// ==== MOXON CORE CALCULATION ====
function calcMoxon(fMHz, d_mm) {
  const lambda = 299792 / fMHz; 
  
  // Reference values: 868 MHz with 1.5mm wire
  const fRef = 868;
  const dRef = 1.5;
  const lambdaRef = 299792 / fRef;

  const kRef = getShorteningFactor(fRef, dRef);
  const kTarget = getShorteningFactor(fMHz, d_mm);
  const kCorr = kTarget / kRef;

  // Geometric coefficients relative to reference wavelength
  const kA = 124.00 / lambdaRef;
  const kB = 8.5 / lambdaRef;
  const kC = 18.0 / lambdaRef;
  const kD = 19.5 / lambdaRef;
  const kE = 46.00 / lambdaRef;

  return {
    A: kA * lambda * kCorr,
    B: kB * lambda * kCorr,
    C: kC * lambda * kCorr,
    D: kD * lambda * kCorr,
    E: kE * lambda * kCorr,
    Z: 50 * (kTarget / kRef),
    area: mmToCrossSection(d_mm)
  };
}

let res = calcMoxon(fMHz, d_mm);

// Unit conversion for output
let unit = 'mm';
if (outMode === '2') {
  unit = 'in';
  res.A = mmToInch(res.A);
  res.B = mmToInch(res.B);
  res.C = mmToInch(res.C);
  res.D = mmToInch(res.D);
  res.E = mmToInch(res.E);
}

// Calculate total wire length 
const totalWireLength = 2 * res.A + 2 * res.B + 2 * res.D

// ==== OUTPUT ====
console.log(`\n=========================================`);
console.log(`MOXON ANTENNA DIMENSIONS`);
console.log(`Frequency: ${fMHz} MHz`);
console.log(`Wire Diameter: ${d_mm.toFixed(3)} mm`);
console.log(`Wire Cross-section: ${res.area.toFixed(3)} mm²`);
console.log(`=========================================`);
console.log(`A: ${res.A.toFixed(2)} ${unit}`);
console.log(`B: ${res.B.toFixed(2)} ${unit}`);
console.log(`C: ${res.C.toFixed(2)} ${unit} (Gap)`);
console.log(`D: ${res.D.toFixed(2)} ${unit}`);
console.log(`E: ${res.E.toFixed(2)} ${unit}`);
console.log(`-----------------------------------------`);
console.log(`Total Wire Length: ${totalWireLength.toFixed(2)} ${unit}`);
console.log(`Estimated Impedance: ~${res.Z.toFixed(1)} Ohm`);
console.log(`=========================================`);
