const express = require('express');
const { v4 } = require('uuid');
const morgan = require('morgan');


const app = express();




const custumers = [];

function verifyCPF(req, res, next) {
    const { cpf } = req.headers;
    
    const custumer = custumers.find((custumer) => custumer.cpf === cpf);
    
    if(!custumer){
        return res.status(400).json({ error: "cpf invalido"})
    }

    req.custumer = custumer;
    return next();
}

app.use(express.json());
app.use(morgan("dev"));


app.post('/conta', (req, res) => { 
    const { cpf, name } = req.body;
                                        // callback
    const custumersExists = custumers.some((custumer) => custumer.cpf === cpf);

    if(custumersExists){
        return res.status(400).json({ error: "ja cadastrado o cpf"});
    }

    custumers.push({
        cpf,
        name,
        id : v4(),
        statement: []
    });

    return res.status(200).json({ mensagem: "Criado com sucesso"});
});

app.get('/extrato', verifyCPF, (req, res) => { 
    const { custumer } = req;

    return res.status(200).json(custumer.statement);
});

app.get('/extrato/data', verifyCPF, (req, res) => { 
    const { custumer } = req;
    const { data } = req.query; 

    const dataformatada = new Date(data + " 00:00");

    const statement = custumer.statement.filter(
        (statement) => 
        statement.data.toDateString() ===
        new Date(dataformatada).toDateString())

    return res.status(200).json(statement);
});

app.post('/deposito', verifyCPF, (req, res) =>{
    const { descricao, valor } = req.body;
    console.log(descricao);
    const { custumer } = req;

     const operacao = {
         descricao,
         valor,
         data: new Date(),
         tipo: "credito"
     };

     custumer.statement.push(operacao);

    return res.status(200).json({ mensagem: "Cadastrado"});

});

app.put('/conta', verifyCPF, (req, res) => { 
    const { name } = req.body;
    const { custumer } = req;

    custumer.name = name;

    return res.status(201).send();

});

app.get('/conta', verifyCPF, (req, res) => { 
    const { custumer } = req;

    return res.json(custumer);

});

app.delete('/conta', verifyCPF, (req, res) => { 
    const { custumer } = req;

    custumers.splice(custumer, 1);


    return res.json(custumers);

});





app.listen(3334);