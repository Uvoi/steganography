export const countAmplitudes = (audioBuffer: AudioBuffer): number => {
    return audioBuffer.length * audioBuffer.numberOfChannels;
};

export const logChannelAmplitudes = (
  audioBuffer: AudioBuffer,
  channelIndex: number = 0,
): void => {
  const channelData = audioBuffer.getChannelData(channelIndex);
  console.log(
    `Amplitudes for channel ${channelIndex}:`,
    channelData
  );
};




function increaseNumber(value:number, operationType:number):number {
  switch (operationType) {
      case 1: {
          return (Math.pow(value, 1.2) * 1.1);
      }
      case 2: {
          return (value * 1.3 + 50);
      }
      case 3: {
          return (value * 1.5 - 30);
      }
      case 4: {
          return (Math.sqrt(value) * 2 + 100);
      }
      case 5: {
          return (Math.pow(value, 1.5) + 150);
      }
      case 6: {
          return (value * 1.4 + 200);
      }
      case 7: {
          return (Math.sqrt(value) * 3 + 300);
      }
      case 8: {
          return (value * 1.2 + 500);
      }
      case 9: {
          return (Math.pow(value, 1.3) * 1.2);
      }
      default: {
          return value*1.5;
      }
  }
}


function decreaseNumber(value:number, operationType:number):number {

  switch (operationType) {
      case 1: {
          return (value * 0.9);
      }
      case 2: {
          return (value - 100);
      }
      case 3: {
          return (Math.sqrt(value) * 0.7);
      }
      case 4: {
          return (value * 0.8 - 50);
      }
      case 5: {
          return (Math.pow(value, 0.8) - 100);
      }
      case 6: {
          return (value * 0.85 - 150);
      }
      case 7: {
          return (Math.sqrt(value) * 0.5 + 50);
      }
      case 8: {
          return (value * 0.75);
      }
      case 9: {
          return Math.pow(value, 0.6) - 200;
      }
      default: {
          return value-value/2;
      }
  }
}

function checkAndAdjust(value: number, count: number, operationType: number, cycles: number = 0):number {
  let minLimit = 500;
  let maxLimit = count - (count / 8);
  console.log('value: ',value, '--', cycles)

  if (value < 0) {
    value *= -1;
  }

  if (cycles > 10) {
    console.log("Max recursion depth reached. Returning adjusted value.");
    return Math.round(count - count / 5 - count / 4 + count / 10);
  }

  let oldValue = value;

  if (value < minLimit) {
    console.log(`Value is less than ${minLimit}, adjusting to increase.`);
    value = increaseNumber(value, operationType+1);
  }

  if (value > maxLimit) {
    console.log(`Value is greater than ${maxLimit}, adjusting to decrease.`);
    value = decreaseNumber(value, operationType+1);
  }

  if (value === oldValue) {
    console.log(`Value didn't change, exiting recursion.`);
    return Math.round(value);
  }

  return Math.round(checkAndAdjust(value, count, operationType, cycles + 1));
}




export function getPosition (count: number)
{
  const strCount = String(count)
  let res = 1;
  let operation = 1;

  if (strCount.length < 5)
  {
    console.log('So short audio')
    return 0
  }

  if (count % 2 == 0) {
    switch (strCount[0]) {
        case '1': {
            console.log('1');
            if (Number(strCount[2] + strCount[4]) % 3 == 0) {
                res = (Math.sqrt(count));
            } else {
                res = (Math.sqrt(count - count / 3));
            }
            operation = 1;
            break;
        }

        case '2': {
            console.log('2');
            if (Number(strCount[1] + strCount[0]) % 2 == 0) {
                res = (Math.pow(count / Math.pow(10, (strCount.length - 3)), 1.5));
            } else {
                res = (count / 2 - Math.sqrt(count - count / 3));
            }
            operation = 2;
            break;
        }

        case '3': {
            console.log('3');
            if (Number(strCount[1] + strCount[0]) % 2 == 0 && strCount[1] != '2') {
                res = (Math.pow(count / Math.pow(10, (strCount.length - 3)), 1.5) - Number(strCount[2] + strCount[3] + strCount[0] + strCount[1]));
            } else {
                res = Number(strCount[2] + strCount[3] + '5' + strCount[3]);
            }
            operation = 3;
            break;
        }

        case '4': {
            console.log('4');
            if (Number(strCount[1] + strCount[0]) % 2 == 0) {
                res = (Math.pow(count / Math.pow(10, (strCount.length - 3)), 1.5));
            } else {
                res = (count / 2 - Math.sqrt(count - count / 3));
            }
            operation = 4;
            break;
        }

        case '5': {
            console.log('5');
            if (Number(strCount[0]) % 2 === 0) {
                res = (Math.sqrt(count) * 0.85);
                res = Math.max(res, (count / 6));
            } else {
                res = (Math.pow(count, 1 / 3) * 0.9);
            }
            operation = 5;
            break;
        }

        case '6': {
            console.log('6');
            let lengthFactor = strCount.length;
            res = (count / lengthFactor);
            operation = 6;
            break;
        }

        case '7': {
            console.log('7');
            let lastDigits = Number(strCount.slice(-2));
            res = (count * (lastDigits / 100));
            operation = 7;
            break;
        }

        case '8': {
            console.log('8');
            let sumDigits = strCount.split('').reduce((acc, digit) => acc + Number(digit), 0);
            res = (count / (sumDigits + 1));
            operation = 8;
            break;
        }

        case '9': {
            console.log('9');
            let productDigits = strCount.slice(0, 4).split('').reduce((acc, digit) => acc * Number(digit), 1);
            res = (count / (productDigits + 1));
            operation = 9;
            break;
        }

        default: {
            console.log('default');
            let firstDigit = Number(strCount[0]);
            res = (count * (firstDigit / 10));
            operation = 0;
            break;
        }
    }

  } 
  else {
    switch (strCount[0]) {
        case '1': {
            console.log('1 (else)');
            let factorial = 1;
            for (let i = 1; i <= Number(strCount[0]); i++) {
                factorial *= i;
            }
            res = (Math.sqrt(count) / factorial);
            operation = 1;
            break;
        }

        case '2': {
            console.log('2 (else)');
            let sinFactor = Math.sin(Number(strCount[strCount.length - 1]) * Math.PI / 10);
            res = (count * sinFactor);
            operation = 2;
            break;
        }

        case '3': {
            console.log('3 (else)');
            let diff = Math.abs(strCount.length - count);
            res = (Math.log(diff + 1) * 50);
            operation = 3;
            break;
        }

        case '4': {
            console.log('4 (else)');
            let sumOfSquares = strCount.split('').reduce((acc, digit) => acc + Math.pow(Number(digit), 2), 0);
            res = (Math.sqrt(sumOfSquares) * 1.2);
            operation = 4;
            break;
        }

        case '5': {
            console.log('5 (else)');
            let lastDigit = Number(strCount[strCount.length - 1]);
            let factor = lastDigit + 1;
            res = (count * (factor / 10));
            operation = 5;
            break;
        }

        case '6': {
            console.log('6 (else)');
            let logLength = Math.log(strCount.length);
            res = (count / logLength);
            operation = 6;
            break;
        }

        case '7': {
            console.log('7 (else)');
            let digitSum = strCount.split('').reduce((acc, digit) => acc + Number(digit), 0);
            res = (count / (digitSum + 1));
            operation = 7;
            break;
        }

        case '8': {
            console.log('8 (else)');
            let productFirstTwoDigits = Number(strCount[0]) * Number(strCount[1]);
            res = (count / (productFirstTwoDigits + 1));
            operation = 8;
            break;
        }

        case '9': {
            console.log('9 (else)');
            let cubeCount = Math.pow(count, 3);
            res = (cubeCount / (Number(strCount[0]) + 1));
            operation = 9;
            break;
        }

        default: {
            console.log('default (else)');
            res = (count / strCount.length);
            operation = 0;
            break;
        }
    }
  }

  return checkAndAdjust(res, count, operation)


}