'use client'

import React, { useState, useEffect } from 'react';

// Type for props of both components
type BinaryButtonsProps = {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
};



export const BinaryInput: React.FC<BinaryButtonsProps> = ({ 
  value = "00000000000", 
  onChange,
  readOnly = false
}) => {
  const [binaryValue, setBinaryValue] = useState<string>(value.padStart(11, '0').slice(0, 11));

  // Bit values for each position (from left to right)
  const bitValues = [1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1];

  // Update internal state when prop changes
  useEffect(() => {
    setBinaryValue(value.padStart(11, '0').slice(0, 11));
  }, [value]);

  const toggleBit = (index: number) => {
    if (readOnly) return;
  
    const newBinaryValue = binaryValue.split('').map((bit, i) => {
      if (i === index) {
        return bit === '1' ? '0' : '1';
      }
      return bit;
    }).join('');
  
    setBinaryValue(newBinaryValue);
  
    if (onChange) {
      onChange(newBinaryValue);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex space-x-2 items-center mb-1">
        {bitValues.map((value, index) => (
          <div key={`value-${index}`} className="w-10 text-center text-xs font-medium text-gray-500">
            {value}
          </div>
        ))}
      </div>
    
      <div className="flex space-x-2 items-center">
        {binaryValue.split('').map((bit, index) => (
          <button 
            key={index}
            onClick={() => toggleBit(index)}
            disabled={readOnly}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${bit === '1' ? 'bg-blue-500' : 'bg-gray-300'} 
              ${!readOnly ? 'hover:ring-2 hover:ring-blue-300 active:ring-4' : ''}
              transition-colors duration-200`}
            title={`Bit value: ${bitValues[index]}`}
          >
          </button>
        ))}
      </div>
    </div>
  );
};





// // Demo component showing both in action
// const BinaryButtonsDemo = () => {
//   const [binary1, setBinary1] = useState("10101010101");
//   const [binary2, setBinary2] = useState("00000000000");
  
//   return (
//     <div className="p-6 space-y-8">
//       <div>
//         <h2 className="text-lg font-medium mb-2">Display-only Binary (from props)</h2>
//         <BinaryDisplay value={binary1} />
//       </div>
      
//       <div>
//         <h2 className="text-lg font-medium mb-2">Interactive Binary</h2>
//         <BinaryInput 
//           value={binary2} 
//           onChange={(newValue) => setBinary2(newValue)} 
//         />
//       </div>
      
//       <div className="pt-4">
//         <div>Current value: {binary2}</div>
//         <div>Decimal: {parseInt(binary2, 2)}</div>
//       </div>
//     </div>
//   );
// };

// export default BinaryButtonsDemo;