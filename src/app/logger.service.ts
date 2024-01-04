const ENV = 'debug';

const log = (context: string, ...args) => {
  const ruleConfig = localStorage.getItem(ENV);
  if (!ruleConfig) {
    return;
  }

  const rules = (localStorage.getItem(ENV) || '').split(',');
  // *
  // page:*
  // page
  const pass = rules.some((rule) => {
    const rgx = new RegExp(rule.replace('*', '.*'));
    console.log(rgx);
    return rgx.test(context);
  });

  if (pass) {
    console.log(...args);
  }
};

export default (context: string) =>
  (...args) =>
    log(context, ...args);
