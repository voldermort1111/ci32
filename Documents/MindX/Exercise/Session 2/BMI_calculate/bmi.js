const heightCm = prompt("Enter your height (cm)");
const weight = prompt("Enter your weight (kg)");
const heightM = heightCm/100;
const bmi = weight/(heightM**2);
let bodyIndex= "Obese";
if(bmi<16){
    bodyIndex = "Severely underweight";       
}else if(bmi<18.5){
    bodyIndex = "Underweight";
}else if(bmi<25){
    bodyIndex = "Normal";
}else if(bmi<30){
    bodyIndex = "Overweight";
}
alert(`Your BMI = ${bmi}\nYou are ${bodyIndex}!`);