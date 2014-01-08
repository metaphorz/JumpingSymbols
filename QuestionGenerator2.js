//generate random expression
function getRandomExpresstion(){
	var expression = new Array;
	var hasParenthesis = false;
	var length = getRandomNumber(3)+3;//generate random number from 3 to 5
	
	for(var i=0; i<length; i++){//3~5 + or - operator
		var sign = getRandomNumber(2);//generate random number to decide whether it is + or -
		
		if(expression.length != 0){//foremost number doesn't have operator before
			//ex) 3+5*2  3 doesn't have operator before
			
			if(sign == 1){
				expression.push("+");
			}else{
				expression.push("-");
			}
		}
		
		var number = getRandomNumber(19) + 2;//generate random number from 2 to 20
		
		//push number
		expression.push(number.toString());
		
		//to have parenthesis
		if( i != 0 && hasParenthesis == false){
			//have parenthesis at 50%
			if(getRandomNumber(2) == 0){
				expression.splice(expression.length-3,0,"(");
				expression.push(")");
				
				hasParenthesis = true;
			} 
		}
		
		
		//to decide which operator we will use
		if(getRandomNumber(2) == 0){
			//have + or - at 50%
			
		}else if(getRandomNumber(2) == 0){
			//have * at 25% 
			var number2 = getRandomNumber(9) + 2;
			expression.push("*");
			expression.push(number2.toString());
			
		}else if(!isPrime(number) && getRandomNumber(2) == 0){
			//check whether it is prime number available for division and has / at 12.25%
			expression.push("/");
			expression.push(findFactor(number).toString());
		}
	}
	
	return expression;
}

function createQuestion(){
	var isRightQuestion = false;
	var expression = "";
	
	var approxLength = 0;
	do{
		expression = getRandomExpresstion();
		
		var length = expression.length;
		
		var cs="";
		for(var i=0; i<length; i++){
			cs += expression[i];
		}
		
		approxLength = 0;
		
		//when expression is so long, cut it
		length = cs.length;
		for(var i=0; i<length; i++){
			if(  (cs[i] >= '0' && cs[i] <= '9') || cs[i] == '(' || cs[i] == ')'  ){//we count each number as weight 1
				approxLength++;
			}else{//we count operator as weight 3
				approxLength += 3;				
			}
		}
	}while(approxLength >= 22);// appropriate length is 22
		
	return expression;
}

//to generate random number
function getRandomNumber(number){
	return Math.floor(Math.random()*number);
}

//find a prime number available for division
function findFactor(number){
	var factors = new Array();
	
	//make list available for division. Except same number with itself
	for(var i=2; i<number; i++){
		if(number % i == 0){
			factors.push(i);
		}
	}
	
	//return one of something available for devision
	return factors[getRandomNumber(factors.length)];
}

function isPrime(candidate){
	// Test whether the parameter is a prime number or not
	for(var i=2; i<candidate; i++){
		if(candidate % i == 0){
			return false;
		}
	}
	return true;
}
