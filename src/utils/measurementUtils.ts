// Measurement key -> image mapping (static requires for RN bundler)
export const measurementImages: Record<string, any> = {
  height: require('../assets/height.png'), // Correct height image
  chest: require('../assets/chest.png'),
  waist: require('../assets/waist.png'),
  shoulder: require('../assets/shoulder.png'),
  hip: require('../assets/hip.webp'),
  armhole: require('../assets/arm_hole.webp'),
  sleeveLength: require('../assets/sleeve_lenght.webp'),
  neck: require('../assets/neck.webp'), // Using neck image
  bicep: require('../assets/bicep.webp'), // Using bicep image
  wrist: require('../assets/arm_wrist.webp'), // Using wrist image
  // Temporary placeholders: replace files with dedicated images named below
  inseam: require('../assets/inseam_.webp'),
  outseam: require('../assets/outseam.webp'),
  knee: require('../assets/knee.webp'),
  thigh: require('../assets/thigh.webp'),
  calf: require('../assets/calf.webp'),
  ankle: require('../assets/ankle_length.webp'),
};

// Function to get required measurements based on outfit type and gender
export const getRequiredMeasurements = (outfitType: string, gender: string) => {
  const baseMeasurements = ['height', 'chest', 'waist', 'shoulder'];
  
  switch (outfitType.toLowerCase()) {
    // Quick aliases / normalizations
    case 'pajama':
    case 'pajamas':
    case 'pants':
    case 'pant':
    case 'trouser':
    case 'trousers':
      // Bottom wear: prefer lower-body measurements
      return ['waist', 'hip', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];

    case 'kurti':
    case 'top':
    case 'tshirt':
    case 'shirt':
    case 'formal shirt':
    case 'casual shirt':
      // Upper garments
      return ['height', 'chest', 'waist', 'shoulder', 'armhole', 'sleeveLength', 'neck', 'bicep', 'wrist'];

    case 'skirt':
      // Skirt-like bottom
      return ['waist', 'hip', 'outseam'];

    case 'jacket':
    case 'blazer':
    case 'women_blazer':
    case 'ethnic_jacket':
    case 'indo_western':
      return ['height', 'chest', 'waist', 'shoulder', 'armhole', 'sleeveLength', 'neck', 'bicep', 'wrist'];

    case 'lehenga':
    case 'sharara':
    case 'underskirt':
      return ['waist', 'hip', 'outseam'];

    case 'gown':
    case 'dress':
      return ['height', 'chest', 'waist', 'hip', 'shoulder', 'armhole', 'sleeveLength', 'neck'];

    case 'camisole':
    case 'nighty':
      return ['height', 'chest', 'waist', 'hip'];

    case 'kurta':
      return ['height', 'chest', 'waist', 'hip', 'shoulder', 'armhole', 'sleeveLength', 'neck'];

    case 'kurta pajama':
      return ['height', 'chest', 'waist', 'hip', 'shoulder', 'armhole', 'sleeveLength', 'neck', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];

    // Female Traditional Wear
    case 'salwar kameez':
    case 'churidar suit':
    case 'anarkali':
      return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck', 'inseam', 'outseam'];
    
    case 'kurti with palazzo/pants':
      return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];
    
    case 'lehenga choli':
      return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck', 'waist'];
    
    case 'blouse (for saree)':
    case 'princess cut blouse':
      return [...baseMeasurements, 'armhole', 'sleeveLength', 'neck'];
    
    case 'saree petticoat':
      return [...baseMeasurements, 'hip', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];
    
    case 'saree fall & pico (stitching service)':
      return [...baseMeasurements, 'waist'];
    
    // Female Western Wear
    case 'dress (a-line, bodycon, maxi, etc.)':
      return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];
    
    case 'formal shirt':
      return [...baseMeasurements, 'armhole', 'sleeveLength', 'neck', 'bicep', 'wrist'];
    
    case 'trousers':
      return [...baseMeasurements, 'hip', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];
    
    case 'jumpsuit':
      return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];
    
    case 'puff sleeves kurti':
      return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck'];
    
    case 'flared palazzo':
      return [...baseMeasurements, 'hip', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];
    
    case 'asymmetrical dress':
      return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];
    
    // Male Traditional Wear
    case 'kurta':
    case 'kurta pajama':
      return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck', 'inseam', 'outseam'];
    
    case 'sherwani':
      return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck', 'inseam', 'outseam', 'bicep', 'wrist'];
    
    case 'dhoti kurta':
      return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck', 'inseam', 'outseam'];
    
    // Male Western/Formal Wear
    case 'shirt':
    case 'casual shirt':
    case 'formal shirt':
      return [...baseMeasurements, 'armhole', 'sleeveLength', 'neck', 'bicep', 'wrist'];
    
    case 'half sleeve / full sleeve':
      return [...baseMeasurements, 'armhole', 'sleeveLength', 'neck', 'bicep', 'wrist'];
    
    case 'pant / trouser':
      return [...baseMeasurements, 'hip', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];
    
    case 'blazer / coat / suit':
    case 'tuxedo':
    case '3-piece suit':
      return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck', 'inseam', 'outseam', 'bicep', 'wrist'];
    
    case 'shorts':
      return [...baseMeasurements, 'hip', 'inseam', 'outseam', 'thigh', 'knee', 'calf'];
    
    case 'jeans (custom fit)':
      return [...baseMeasurements, 'hip', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];
    
    default:
      // Return all measurements for unknown outfit types
      return ['height', 'chest', 'waist', 'hip', 'shoulder', 'armhole', 'sleeveLength', 'neck', 'bicep', 'wrist', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];
  }
};

// Measurement field labels mapping
export const measurementLabels: Record<string, string> = {
  height: 'order.height',
  chest: 'measurement.chest',
  waist: 'measurement.waist',
  hip: 'measurement.hip',
  shoulder: 'measurement.shoulder',
  sleeveLength: 'order.sleeveLength',
  inseam: 'order.inseam',
  outseam: 'order.outseam',
  neck: 'order.neck',
  armhole: 'order.armhole',
  bicep: 'order.bicep',
  wrist: 'order.wrist',
  thigh: 'order.thigh',
  knee: 'order.knee',
  calf: 'order.calf',
  ankle: 'order.ankle',
};

