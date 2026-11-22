// Utility for classification colors, labels, and formatting matching ObjectVision AI telemetry

export const getClassMetadata = (rawLabel) => {
  const l = (rawLabel || '').toLowerCase().trim();

  // 1. Bus (Magenta / Purple #EC4899)
  if (l === 'bus') {
    return {
      category: 'Bus',
      displayLabel: 'Bus',
      color: '#EC4899',
      bg: '#EC4899',
      text: '#FFFFFF',
      glow: 'rgba(236, 72, 153, 0.4)'
    };
  }

  // 2. Bike / Motorcycle (Vibrant Green #10B981)
  if (['bike', 'motorcycle', 'bicycle'].includes(l)) {
    return {
      category: 'Bike',
      displayLabel: 'Bike',
      color: '#10B981',
      bg: '#10B981',
      text: '#070A12',
      glow: 'rgba(16, 185, 129, 0.4)'
    };
  }

  // 3. Traffic Light (Signal Red #EF4444)
  if (['traffic light', 'traffic sign', 'stop sign'].includes(l)) {
    return {
      category: 'Traffic Light',
      displayLabel: 'Traffic Light',
      color: '#EF4444',
      bg: '#EF4444',
      text: '#FFFFFF',
      glow: 'rgba(239, 68, 68, 0.4)'
    };
  }

  // 4. Aeroplane / Flight (Cyan #00F2FE)
  if (['aeroplane', 'airplane', 'plane'].includes(l)) {
    return {
      category: 'Aeroplane',
      displayLabel: 'Aeroplane',
      color: '#00F2FE',
      bg: '#00F2FE',
      text: '#070A12',
      glow: 'rgba(0, 242, 254, 0.4)'
    };
  }

  // 5. Dog / Canines (Warm Orange #F97316)
  if (l === 'dog') {
    return {
      category: 'Dog',
      displayLabel: 'Dog',
      color: '#F97316',
      bg: '#F97316',
      text: '#070A12',
      glow: 'rgba(249, 115, 22, 0.4)'
    };
  }

  // 6. Persons (Warm Amber #F59E0B)
  if (['person', 'pedestrian'].includes(l)) {
    return {
      category: 'Person',
      displayLabel: 'Person',
      color: '#F59E0B',
      bg: '#F59E0B',
      text: '#070A12',
      glow: 'rgba(245, 158, 11, 0.4)'
    };
  }

  // 7. Cars & Vehicles (Neon Cyan #00F2FE)
  const vehicleClasses = ['car', 'truck', 'train', 'boat'];
  if (vehicleClasses.includes(l)) {
    let display = 'Car';
    if (l === 'truck') display = 'Truck';
    else if (l === 'train') display = 'Train';
    else if (l === 'boat') display = 'Boat';

    return {
      category: 'Car',
      displayLabel: display,
      color: '#00F2FE',
      bg: '#00F2FE',
      text: '#070A12',
      glow: 'rgba(0, 242, 254, 0.4)'
    };
  }

  // 8. Tech Classes
  const techClasses = ['laptop', 'cell phone', 'tv', 'keyboard', 'mouse', 'remote'];
  if (techClasses.includes(l)) {
    const display = l === 'cell phone' ? 'Phone' : l.charAt(0).toUpperCase() + l.slice(1);
    return {
      category: 'Tech / Gadget',
      displayLabel: display,
      color: '#00F2FE',
      bg: '#00F2FE',
      text: '#070A12',
      glow: 'rgba(0, 242, 254, 0.4)'
    };
  }

  // 9. Other Animals & Organics (Sky #38BDF8)
  const animalClasses = ['cat', 'bird', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe'];
  if (animalClasses.includes(l)) {
    return {
      category: 'Animal',
      displayLabel: l.charAt(0).toUpperCase() + l.slice(1),
      color: '#38BDF8',
      bg: '#38BDF8',
      text: '#070A12',
      glow: 'rgba(56, 189, 248, 0.4)'
    };
  }

  // 10. Default Objects
  return {
    category: 'Object',
    displayLabel: rawLabel ? (rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1)) : 'Object',
    color: '#00F2FE',
    bg: '#00F2FE',
    text: '#070A12',
    glow: 'rgba(0, 242, 254, 0.4)'
  };
};

export const formatConfidence = (conf) => {
  if (conf === undefined || conf === null) return '0.90';
  const num = typeof conf === 'number' ? conf : parseFloat(conf);
  return num.toFixed(2);
};
