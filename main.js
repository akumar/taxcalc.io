$(document).ready(function () {
  const ORT = 'old_regime_txt';
  const NRT = 'new_regime_txt';
  let taxable_income_old_reg = 0;
  let taxable_income_property_old_reg = 0;
  let taxable_income_capital_gains_or = 0;
  let total_income_business_profession_or = 0;
  let profit_and_gains_business_or_profession_or = 0;

  const grossSalaryParams = [
    'basic_da',
    'hra',
    'other_allow',
    'other_taxable_allowances',
  ];
  // const netAmountHousePropertyParams = ['yearly_rent', 'municipal_tax'];

  const validateNumber = (val) => {
    return isNaN(Number(val)) ? 0 : Number(val);
  };
  const getValue = (id, regime) => {
    return isNaN(Number($(`#${id}_${regime}`).text()))
      ? 0
      : Number($(`#${id}_${regime}`).text());
  };

  const grossIncomeFromSalary = () => {
    let old_reg_gross = 0;
    let new_reg_gross = 0;
    let gross = [];
    grossSalaryParams.forEach((param) => {
      old_reg_gross += getValue(param, ORT);
      new_reg_gross += getValue(param, NRT);
    });
    // taxable
    old_reg_taxable = old_reg_gross - $('#other_exempted_allowances').val();
    new_reg_taxable = new_reg_gross;

    // standard deduction
    old_reg_sd = old_reg_taxable > 50000 ? 50000 : old_reg_taxable;
    new_reg_sd = new_reg_taxable > 50000 ? 50000 : new_reg_taxable;

    // income_taxable
    professional_tax =
      $('#professional_tax').val() > 2500 ? 2500 : $('#professional_tax').val();
    taxable_income_old_reg = old_reg_taxable - old_reg_sd - professional_tax;
    taxable_income_new_reg = new_reg_taxable - new_reg_sd;

    gross['old_reg'] = {
      gross_income: old_reg_gross,
      taxable: old_reg_taxable,
      sd: old_reg_sd,
      taxable_income: taxable_income_old_reg,
    };
    gross['new_reg'] = {
      gross_income: new_reg_gross,
      taxable: new_reg_taxable,
      sd: new_reg_sd,
      taxable_income: taxable_income_new_reg,
    };
    return gross;
  };

  const calculateIncomeUnderProperty = () => {
    let gross = [];
    net_value_or = 0;
    net_value_nr = 0;

    net_value_or =
      getValue('yearly_rent', ORT) - getValue('municipal_tax', ORT);
    net_value_nr =
      getValue('yearly_rent', NRT) - getValue('municipal_tax', NRT);

    netIncomeLoss_or =
      net_value_or -
      net_value_or * 0.3 -
      getValue('yearly_housing_loan_interest', ORT);
    netIncomeLoss_nr =
      net_value_nr -
      net_value_nr * 0.3 -
      getValue('yearly_housing_loan_interest', NRT);
      const yhli_or = getValue('yearly_home_loan_interest', ORT)
      const yhli_nr = getValue('yearly_home_loan_interest', NRT)  
      ni_yli_or = Number(Math.abs(netIncomeLoss_or) + yhli_or);
      ni_yli_nr = Number(Math.abs(netIncomeLoss_nr) + yhli_nr);

      taxable_income_property_old_reg = Math.min(ni_yli_or, 200000);
      taxable_income_property_new_reg = Math.min(ni_yli_nr, 200000);
    gross['old_reg'] = {
      net_annual_value: net_value_or,
      sd: net_value_or * 0.3,
      netLoss: netIncomeLoss_or,
      taxable_income: taxable_income_property_old_reg,
    };
    gross['new_reg'] = {
      net_annual_value: net_value_nr,
      sd: net_value_nr * 0.3,
      netLoss: netIncomeLoss_nr,
      taxable_income: taxable_income_property_new_reg,
    };
    return gross;
  };

  const finalCalculation = () => {
    let grossTotalIncome_or = 0;

    grossTotalIncome_or = (taxable_income_old_reg  + taxable_income_capital_gains_or + total_income_business_profession_or + profit_and_gains_business_or_profession_or) - taxable_income_property_old_reg;


    $(`#gross_total_income_business_profession_${ORT}`).text(grossTotalIncome_or);
    // gross_nr = taxable_income_capital_gains_nr + total_income_business_profession_nr+profit_and_gains_business_or_profession_nr;  
    // $(`#gross_total_income_business_profession_${NRT}`).text(gross_nr);

  }

  // Select all elements with the class "my-input"
  $('.salary-head-input, .houseincome-head-input, .business-profession-income-head-input, .deduction-head-input').on('keypress', function (e) {
    const pattern = /^[0-9]$/;
    return pattern.test(e.key);
  });
  $('.salary-head-input').on('change', function () {
    inputVal = validateNumber($(this).val());

    $(this).attr('id') == 'professional_tax' && inputVal > 2500
      ? (inputVal = 2500)
      : inputVal;
    $(`#${$(this).attr('id')}_${ORT}`).text(inputVal);
    $(`#${$(this).attr('id')}_${NRT}`).text(inputVal);

    // update gross salary
    const gross = grossIncomeFromSalary();
    // console.log(gross);
    $('#gross_salary_' + ORT).text(gross['old_reg']?.gross_income);
    $('#gross_salary_' + NRT).text(gross['new_reg']?.gross_income);

    $('#taxable_salary_' + ORT).text(gross['old_reg']?.taxable);
    $('#taxable_salary_' + NRT).text(gross['new_reg']?.taxable);

    $('#standard_deduction_' + ORT).text(gross['old_reg']?.sd);
    $('#standard_deduction_' + NRT).text(gross['new_reg']?.sd);

    $('#income_taxable_salary_' + ORT).text(gross['old_reg']?.taxable_income);
    $('#income_taxable_salary_' + NRT).text(gross['new_reg']?.taxable_income);

    finalCalculation();
  });

  $('.houseincome-head-input').on('change', function () {
    inputVal = validateNumber($(this).val());
    $(this).attr('id') == 'yearly_home_loan_interest' && inputVal > 200000
      ? (inputVal = '-200000')
      : inputVal;
    $(this).attr('id') == 'yearly_housing_loan_interest' && inputVal > 200000
      ? (inputVal = '200000')
      : inputVal;

    $(`#${$(this).attr('id')}_${ORT}`).text(inputVal);
    $(`#${$(this).attr('id')}_${NRT}`).text(inputVal);

    const houseIncome = calculateIncomeUnderProperty();

    // console.log(houseIncome);

    $('#net_annual_value_' + ORT).text(
      houseIncome['old_reg']?.net_annual_value
    );
    $('#net_annual_value_' + NRT).text(
      houseIncome['new_reg']?.net_annual_value
    );

    $('#standard_deduction_property_' + ORT).text(houseIncome['old_reg']?.sd);
    $('#standard_deduction_property_' + NRT).text(houseIncome['new_reg']?.sd);

    $('#net_income_loss_property_' + ORT).text(houseIncome['old_reg']?.netLoss);
    $('#net_income_loss_property_' + NRT).text(houseIncome['new_reg']?.netLoss);

    $('#taxable_income_property_' + ORT).text(
      houseIncome['old_reg']?.taxable_income
    );
    $('#taxable_income_property_' + NRT).text(
      houseIncome['new_reg']?.taxable_income
    );
    finalCalculation();
  });

  $(".business-profession-income-head-input").on('change', function () {
    inputVal = validateNumber($(this).val());
    $(`#${$(this).attr('id')}_${ORT}`).text(inputVal);
    $(`#${$(this).attr('id')}_${NRT}`).text(inputVal);
    taxable_income_capital_gains_or = getValue('st_capital_gain_sec_111A', ORT) + getValue('st_capital_gain_sec_112', ORT);
    taxable_income_capital_gains_nr = getValue('st_capital_gain_sec_111A', NRT) + getValue('st_capital_gain_sec_112', NRT);
    $(`#taxable_income_capital_gains_${ORT}`).text(taxable_income_capital_gains_or);
    $(`#taxable_income_capital_gains_${NRT}`).text(taxable_income_capital_gains_nr);
  
    total_income_business_profession_or = 
      getValue('bank_interest_saving_ac', ORT) + 
      getValue('bank_interest_term_deposit', ORT) + 
      getValue('dividend', ORT) + 
      getValue('other_income_from_business', ORT);
  
    total_income_business_profession_nr = 
      getValue('bank_interest_saving_ac', NRT) + 
      getValue('bank_interest_term_deposit', NRT) + 
      getValue('dividend', NRT) + 
      getValue('other_income_from_business', NRT);
      profit_and_gains_business_or_profession_or = getValue('profit_and_gains_business_or_profession', ORT);
      $(`#taxable_income_under_business_or_profession_${ORT}`).text(profit_and_gains_business_or_profession_or);
      profit_and_gains_business_or_profession_nr = getValue('profit_and_gains_business_or_profession', NRT);  
      $(`#taxable_income_under_business_or_profession_${NRT}`).text(profit_and_gains_business_or_profession_nr);  
  
    $(`#total_income_business_profession_${ORT}`).text(total_income_business_profession_or);
    $(`#total_income_business_profession_${NRT}`).text(total_income_business_profession_nr);

    gross_or = taxable_income_capital_gains_or + total_income_business_profession_or+profit_and_gains_business_or_profession_or;
    finalCalculation();
  });

  $(".deduction-head-input").on('change', function () {
    inputVal = validateNumber($(this).val());

    $(`#${$(this).attr('id')}_${ORT}`).text(inputVal);
    $(`#${$(this).attr('id')}_${NRT}`).text(inputVal);

    gross_total_80c_ccc_ccd_or = getValue('deduction_80C', ORT) + getValue('deduction_80CCC', ORT) + getValue('deduction_80CCD', ORT);
    $(`#gross_total_80c_ccc_ccd_${ORT}`).text(gross_total_80c_ccc_ccd_or);
    gross_total_80c_ccc_ccd_nr = getValue('deduction_80C', NRT) + getValue('deduction_80CCC', NRT) + getValue('deduction_80CCD', NRT);
    $(`#gross_total_80c_ccc_ccd_${NRT}`).text(gross_total_80c_ccc_ccd_nr);

    // other deductions 
    gross_total_other_deductions_or = getValue('deduction_80CCD1B', ORT) + getValue('deduction_80CCD2', ORT) + getValue('deduction_80D', ORT) + getValue('deduction_80D_parents', ORT) + getValue('deduction_others_1', ORT) + getValue('deduction_others_2', ORT);
    $(`#total_deduction_${ORT}`).text(Number(gross_total_other_deductions_or + gross_total_80c_ccc_ccd_or));
    gross_total_other_deductions_nr = getValue('deduction_80CCD1B', NRT) + getValue('deduction_80CCD2', NRT) + getValue('deduction_80D', NRT) + getValue('deduction_80D_parents', NRT) + getValue('deduction_others_1', NRT) + getValue('deduction_others_2', NRT);
    $(`#total_deduction_${NRT}`).text(Number(gross_total_other_deductions_nr + gross_total_80c_ccc_ccd_nr));
    finalCalculation();
  })


});
