const Modal = {
  toggleTransaction() {
    const toggle = document.querySelector(".active");


    if (!toggle) {
      document.querySelector(".modal-overlay").classList.toggle('active');

    } else {
      document.querySelector(".modal-overlay").classList.toggle('active');
    }

  },

  toggleGoals() {
    const toggle = document.querySelector(".active.goals");


    if (!toggle) {
      document.querySelector(".modal-overlay.goals").classList.toggle('active');

    } else {
      document.querySelector(".modal-overlay.goals").classList.toggle('active');
    }

  },


}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },

  set(transactions) {
    localStorage.setItem("dev.finances:transactions",
      JSON.stringify(transactions))
  },

}

const StorageGoals = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:goals")) || []
  },

  set(goals) {
    localStorage.setItem("dev.finances:goals",
      JSON.stringify(goals))
  },

  remove() {
    localStorage.removeItem("dev.finances:goals")
  }

}

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);

    App.reload()
  },

  remove(index) {
    Transaction.all.splice(index, 1);

    App.reload();
  },

  incomes() {
    let income = 0
    Transaction.all.forEach((trans) => {
      if (trans.amount > 0) {
        income += trans.amount
      }
    })

    return income;
  },
  expenses() {
    let expense = 0
    Transaction.all.forEach((trans) => {
      if (trans.amount < 0) {
        expense += trans.amount
      }
    })

    return expense;
  },
  total() {
    return Transaction.incomes() + Transaction.expenses();
  }
}

const Goals = {
  all: StorageGoals.get(),


  add(goals) {
    Goals.all = goals
    App.reload();
  },

  remove() {
    StorageGoals.remove()
    Goals.all = StorageGoals.get()
    App.reload();
  },

  missing() {
    const string = "Meta Batida!"
    const tot = Transaction.total() - Goals.all.amountgoals
    if (tot < 0) {

      return Utils.formatCurrency(tot)
    } else {
      return string
    }

  },

  days(deadline) {
    //calcular deadline
    let start = new Date()
    let end = new Date(deadline)

    let diffnTime = Math.abs(end - start)
    let timeInOneDay = 1000 * 60 * 60 * 24
    let diffInDays = Math.ceil(diffnTime / timeInOneDay)


    return diffInDays
  },

  economy(days) {
    //calcular quando poupar por dia para atingir a meta
    const tot = Goals.all.amountgoals - Transaction.total()
    if (tot > 0) {
      let totFormat = String(tot).replace(/\D/g, "")
      totFormat = Number(totFormat) / 100


      let division = totFormat / days

      division = division.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BLR"
      })

      division = String(division).replace("BLR", "R$")
      return division
    } else {
      return 0;
    }
  }

}

const domRender = {
  transactionsContainer: document.querySelector('#transactions table tbody'),
  goalsContainer: document.querySelector('#goals table tbody'),

  cardIncome: document.querySelector("#cardincome"),
  cardExit: document.querySelector("#cardexit"),

  addTransaction(transaction, index) {

    const tr = document.createElement('tr')
    tr.innerHTML = domRender.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    domRender.transactionsContainer.appendChild(tr)

  },

  addGoals(goals, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = domRender.innerHTMLGoals(goals, index)
    tr.dataset.index = index

    domRender.goalsContainer.appendChild(tr)
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense"
    const amount = Utils.formatCurrency(transaction.amount)
    const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass} value">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td class="remove">
          <img onclick="Transaction.remove(${index})"src="./assets/minus.svg" alt="Remover transação">
        </td>
    `

    return html
  },

  innerHTMLGoals(goals) {
    const CSSclass = Goals.missing() === "Meta Batida!" ? "income" : "expense"
    const amount = Utils.formatCurrency(goals.amountgoals)
    const total = Transaction.total() <= 0 ? 0 : Transaction.total()
    const collected = Utils.formatCurrency(total);
    const missing = Goals.missing()
    const days = Goals.days(goals.deadline)
    const deadline = Utils.formatDate(goals.deadline)
    const economy = Utils.formatCurrency(Goals.economy(days))

    const html = `
        <td class="income value">${amount}</td>
        <td class="income value">${collected}</td>
        <td class="${CSSclass} value">${missing}</td>
        <td class="income value">${economy}</td>
        <td class="income value">${days}</td>
        <td class="date">${deadline}</td>
        <td class="remove">
          <img onclick="Goals.remove()"src="./assets/minus.svg" alt="Remover meta">
        </td>
    `

    return html
  },

  updateBalance() {

    document.querySelector("#incomeDisplay").innerHTML = Utils.formatCurrency(Transaction.incomes())
    document.querySelector("#expenseDisplay").innerHTML = Utils.formatCurrency(Transaction.expenses())
    document.querySelector("#totalDisplay").innerHTML = Utils.formatCurrency(Transaction.total())

  },

  clearTransaction() {
    domRender.transactionsContainer.innerHTML = ""
    domRender.goalsContainer.innerHTML = ""
  }


}

const Utils = {
  formatAmount(value) {
    value = value * 100

    return Math.round(value)
  },

  formatDate(date) {
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : ""

    value = String(value).replace(/\D/g, "")

    value = Number(value) / 100

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BLR"
    })

    value = String(value).replace("BLR", "R$")
    return signal + value
  },
}

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    }
  },

  validateFields() {
    const { description, amount, date } = Form.getValues();

    if (!description.trim() || !amount.trim() || !date.trim()) {
      throw new Error("Por favor, preencha todos os campos")
    }

  },

  formatValues() {
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date
    }

  },

  clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },


  submit(event) {
    event.preventDefault();

    try {
      Form.validateFields();
      // formatar os dados para salvar
      const transaction = Form.formatValues();
      // salvar
      Transaction.add(transaction)
      // apagar os dados do formulario
      Form.clearFields()
      // modal fechar
      Modal.toggleTransaction()
    } catch (error) {
      alert(error.message)
    }

  }


}

const goalsForm = {
  amountgoals: document.querySelector("input#amountgoals"),
  deadline: document.querySelector("input#deadline"),

  getValues() {
    return {
      amountgoals: goalsForm.amountgoals.value,
      deadline: goalsForm.deadline.value,
    }
  },

  validateFields() {
    const { amountgoals, deadline } = goalsForm.getValues();

    if (!amountgoals.trim() || !deadline.trim()) {
      throw new Error("Por favor, preencha todos os campos")
    }

  },

  formatValues() {
    let { amountgoals, deadline } = goalsForm.getValues()

    amountgoals = Utils.formatAmount(amountgoals)

    //deadline = Utils.formatDate(deadline)

    return {
      amountgoals,
      deadline,
    }

  },

  clearFields() {
    goalsForm.amountgoals.value = ""
    goalsForm.deadline.value = ""
  },


  submit(event) {
    event.preventDefault();

    try {
      goalsForm.validateFields();
      // formatar os dados para salvar
      Goals.missing()

      Goals.days();

      const goals = goalsForm.formatValues();

      // salvar
      Goals.add(goals)
      // apagar os dados do formulario
      goalsForm.clearFields()
      // modal fechar
      Modal.toggleGoals()
    } catch (error) {
      alert(error.message)
    }

  }


}


const App = {
  init() {
    Storage.set(Transaction.all)
    StorageGoals.set(Goals.all)


    if (Transaction.all.length !== 0) {

      Transaction.all.forEach(domRender.addTransaction)
    }

    if (Goals.all.length !== 0) {

      domRender.addGoals(Goals.all)
    }

    domRender.updateBalance()


  },

  reload() {
    domRender.clearTransaction();
    App.init()
  }
}

App.init();

