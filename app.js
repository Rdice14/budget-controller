var budgetController = (function(){
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if (totalIncome > 0){
            this.percentage = Math.round(this.value/totalIncome * 100);
        }        
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum = sum + cur.value;
        });
        data.totals[type] = sum;
        console.log(data.totals[type]);
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val){
            var newItem, ID;

            // create new ID
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else{
                ID = 0;
            }
            // create new Item
            if (type == "exp"){
                newItem = new Expense(ID, des, val);
            }
            else if (type == "inc"){
                newItem = new Income(ID, des, val);
            }

            // push into data structure 
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1){
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function(){
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate the budget = income - expenses + budget
            data.budget = data.totals.inc  - data.totals.exp;
            // calculate percentage of income spent
            if (data.totals.inc > 0){
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        getData: function(){
            console.log(data);
            console.log(data.budget);
            return data;
        }
    }

})();

var UIController = (function(){
    var DOMStrings = {
        inputType: ".add__type",
        inputDesc: ".add__description",
        inputValue: ".add__value",
        inputButton: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercentageLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    };

    var nodeListForEach = function(list, callback){
        for (var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },
        addListItem: function(obj, type){
            var html, newHtml, element;
            // Create HTML string with placeholder text
            if (type == "inc"){
                element = DOMStrings.incomeContainer;
                html = 
                `<div class="item clearfix" id="inc-%id%">
                    <div class="item__description">%description%</div>
                    <div class="right clearfix">
                    <div class="item__value">%value%</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                    </div>
                </div>`;
            } else if (type == "exp"){
                element = DOMStrings.expensesContainer;
                html = 
                ` <div class="item clearfix" id="exp-%id%">
                    <div class="item__description">%description%</div>
                    <div class="right clearfix">
                        <div class="item__value">%value%</div>
                        <div class="item__percentage">21%</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                    </div>
                </div>`;
            }
            // Replace the placeholder with real data
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", obj.value.toFixed(2));
            // Insert the HTML into the DOM
            console.log(element);
            console.log(newHtml);
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDesc + ", " + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            var plusMinus;
            if (obj.budget > 0){
                plusMinus = "+";
            }
            else if (obj.budget < 0){
                plusMinus = "-";
            }else{
                plusMinus = "";
            };
            document.querySelector(DOMStrings.budgetLabel).textContent = plusMinus + (Math.abs(obj.budget)).toFixed(2);
            document.querySelector(DOMStrings.incomeLabel).textContent = "+ " + obj.totalInc.toFixed(2);
            document.querySelector(DOMStrings.expensesLabel).textContent = "- " + obj.totalExp.toFixed(2);
            if (obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + " %";
            }
            else {
                document.querySelector(DOMStrings.percentageLabel).textContent = "---";
            }
        },

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);

            nodeListForEach(fields, function(current, index){
                if (percentages[index] > 0){
                    current.textContent = percentages[index] + "%";
                }else{
                    current.textContent = "---"; 
                }

            })
            
        },

        displayDate: function(){
            var date, months, year;
            date = new Date();
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            year = date.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[date.getMonth()] + " " + year;
        },

        changedType: function(){
            
            var fields = document.querySelectorAll(
                DOMStrings.inputType + "," +
                DOMStrings.inputDesc + "," +
                DOMStrings.inputValue
            );

            nodeListForEach(fields, function(cur){
                cur.classList.toggle("red-focus");
            });

            document.querySelector(DOMStrings.inputButton).classList.toggle("red");
        },

        getDOMStrings: function(){
            return DOMStrings;
        }
    }
})();

var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListeners= function(){
        var DOMStrings = UIController.getDOMStrings();

        document.querySelector(DOMStrings.inputButton).addEventListener('click',ctrlAddItem);
    
        document.addEventListener("keypress", function(event){
            if (event.keyCode == 13 || event.which == 13){
                // console.log("Enter pressed")
                ctrlAddItem();
            }
        });
        document.querySelector(DOMStrings.container).addEventListener("click", ctrlDeleteItem);
        document.querySelector(DOMStrings.inputType).addEventListener("change", UICtrl.changedType);
    };

    var updateBudget = function(){
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function(){
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function(){
        var input, newItem;
        // 1. Get the field input data
        input = UIController.getInput();
        console.log(input);
        if (input.description != "" && !isNaN(input.value) && input.value > 0){
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            // 4. Clear field
            UICtrl.clearFields();
            // 5. Update Budget
            updateBudget();
            // 6. Calculate and update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (event){
        var itemID, splitID, ID, type;    
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID){
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);
            // 1. Delete item from data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. Delete item from UI
            UICtrl.deleteListItem(itemID);
            // 3. Update budget
            updateBudget();
            // 4. Calculate and update percentages
            updatePercentages();
        }
    }

    return {
        init: function(){
            console.log("App has started");
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            setupEventListeners();
            UICtrl.displayDate();
        }
    };

})(budgetController, UIController);

controller.init();