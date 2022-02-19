//Đối tượng 'Validator'
function Validator(options){

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }

            element = element.parentElement;
        }

    }
    var selectorRules = {};

    //Hàm thực hiện validate
    function validate (inputElement, rule) {
        var errorMessage;
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);

        //Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];;

        //Lặp qua từng rules và kiểm tra.
        // Nếu có lỗi thì dừng việc kiểm tra.
        for(var i = 0; i < rules.length; ++i){
            switch (inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage =  rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                     break;
                default: 
                     errorMessage =  rules[i](inputElement.value);
            }
          
           if (errorMessage) 
           break;
        }
                    
        if(errorMessage) {
            errorElement.innerText = errorMessage;;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');

        }else{
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');

        }

        return !errorMessage;


    }

    //Lấy element của form cần validate
    var formElement = document.querySelector(options.form);

    
    if(formElement){
        formElement.onsubmit = function (e) {
            e.preventDefault();


            var isFormValid = true;

            //Thực hiện lặp qua từng rules và validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
               
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                if (typeof options.onSubmit === 'function') {

                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        
                        switch(input.type){
                            case 'radio':
                            case 'checkbox':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                 values[input.name] = input.value;
                        }

                        return values;
                    }, {});

                     options.onSubmit(formValues);
                        
                  
                  

                }
            }
        }


        //Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input,...)
        options.rules.forEach(function (rule) {

            //Lưu lại các rule cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            }else{
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function (inputElement) {
                //Xử lý trường hợp blur khỏi input
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                }

                //Xử lý mỗi khi ngườ dùng nhập vào input
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message');

                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            })

         
        })
    }
}


//Định nghĩa các rules
Validator.isRequired = function(selector){
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này'

        }
    }

}

Validator.isEmail = function(selector){
      return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
            return regex.test(value) ? undefined : 'Trường này phải là email';

        }
    }
}

Validator.minLength = function(selector, min){
    return {
      selector: selector,
      test: function (value) {
          return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự `

      }
  }
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Gía trị nhập vào không chính xác'
        }
    }

}