const n = prompt("Enter the number you want to calculate its factorial");
let factorial = 1;
for(let i=1;i<=n;i++){
    factorial = factorial*(i);
}
alert(`${n}! = ${factorial}`);