---
title: "APIs - Implementação, Consumo e Integração"
description: "Guia completo sobre APIs: como criar, usar e integrar"
date: 2025-09-30
draft: false
---

# APIs — Implementação, Consumo e Integração

## 1. Implementação (como criar uma API)

Quando falamos em **implementar uma API**, estamos no lado do **servidor**, ou seja, quem oferece os dados ou serviços.

### Analogia: O Restaurante

Um jeito simples de entender é imaginar um restaurante:
- O **cliente** pede um prato
- O **garçom (API)** leva o pedido até a **cozinha (servidor)**
- A cozinha prepara e devolve a comida, e o garçom entrega ao cliente

### Endpoints

Na API, os endereços (chamados **endpoints**) funcionam como "portas" para pedir algo. Por exemplo:
- `GET /produtos` → lista os produtos disponíveis
- `POST /pedidos` → cria um pedido novo

### Como o Servidor Deve Responder

Ao implementar uma API, é preciso definir:

1. **Formato padrão**: geralmente JSON, que organiza os dados em estruturas
2. **Mensagens claras**:
   - `200 OK` quando deu certo
   - `404 Not Found` quando não existe
3. **Segurança**:
   - Aceitar só conexões seguras (HTTPS)
   - Verificar quem está pedindo (com chaves ou tokens)
4. **Idempotência**:
   - Se o usuário mandar o mesmo pedido duas vezes, o sistema deve reconhecer e não criar pedidos em dobro

### Exemplo Simples

Uma loja online cria uma API para que aplicativos consigam listar produtos, criar pedidos e acompanhar entregas.

---

## Exemplo de Implementação: iFood

Imagine o **servidor do iFood**. Ele é quem controla todos os restaurantes, cardápios, pedidos e entregas.

Para que o aplicativo (no celular do cliente) consiga acessar essas informações, o iFood **implementa APIs** no seu sistema.

### Endpoints do iFood

Essas APIs têm vários **endpoints** (portas de acesso), cada uma com uma função:

- `GET /restaurantes` → devolve a lista de restaurantes disponíveis perto do usuário
- `GET /restaurantes/{id}/cardapio` → devolve o cardápio de um restaurante específico
- `POST /pedidos` → cria um pedido novo (com os itens escolhidos pelo cliente)
- `GET /pedidos/{id}` → mostra o status de um pedido (em preparo, a caminho, entregue)
- `PUT /pedidos/{id}/status` → o restaurante pode atualizar o status do pedido

### Como Funciona na Prática

1. **Cliente (dentro do iFood)**: "Quero o cardápio da pizzaria X."
2. **API (servidor)**: recebe a requisição no endpoint `/restaurantes/123/cardapio`
3. **Servidor**: busca no banco de dados os itens da pizzaria 123
4. **API**: devolve uma resposta em JSON, algo assim:

```json
{
  "restaurante": "Pizzaria do Bairro",
  "cardapio": [
    {"item": "Pizza de Calabresa", "preco": 45.90},
    {"item": "Refrigerante 2L", "preco": 9.50}
  ]
}
```

5. **App do cliente**: traduz esse JSON em telas bonitas para o usuário ver

### O que a Implementação Precisa Cuidar

- **Segurança**: só usuários logados podem criar pedidos
- **Idempotência**: se o cliente clicar em "Finalizar pedido" duas vezes, não deve gerar 2 pedidos
- **Mensagens claras**: se um restaurante estiver fechado, retornar 400 ou 404 com a mensagem "Restaurante indisponível"
- **Escalabilidade**: como milhões de usuários pedem ao mesmo tempo, a API precisa estar preparada para responder rápido e com estabilidade

> Ou seja, quando dizemos que o iFood "implementa uma API", significa que ele programou essas regras, endpoints e respostas dentro do servidor para que todos os clientes (apps) e parceiros (restaurantes, entregadores, meios de pagamento) consigam se comunicar de forma padronizada.

---

## 2. Consumo da API (como usar uma API)

Se a **implementação** é o lado do servidor, o **consumo** é o lado do **cliente**.

É quando um aplicativo, site ou sistema faz um **pedido** para a API e recebe uma **resposta**.

### Analogia

Voltando ao exemplo do restaurante: agora você está do outro lado, como **cliente**. Você pede a comida (requisição) e recebe o prato pronto (resposta).

### Quem Consome a API do iFood

- O aplicativo no celular do cliente
- O sistema do restaurante
- Outros serviços integrados (como meios de pagamento)

### Exemplo Prático no iFood

1. O usuário abre o app e procura a "Pizzaria do Bairro"
2. O app faz uma requisição: `GET /restaurantes/123/cardapio`
3. A API responde com o cardápio em formato JSON:

```json
{
  "restaurante": "Pizzaria do Bairro",
  "cardapio": [
    {"item": "Pizza Calabresa", "preco": 45.90},
    {"item": "Refrigerante 2L", "preco": 9.50}
  ]
}
```

4. O aplicativo lê essa resposta e transforma em uma **tela visual** com imagens, botões e preços para o usuário

### O que é Importante no Consumo

1. **Montar a requisição corretamente**:
   - Usar o endpoint certo
   - Passar parâmetros (ex.: localização do cliente, filtros de restaurantes)

2. **Tratar os erros**:
   - Se a internet cair ou o servidor estiver ocupado, o app precisa avisar o usuário ("Não foi possível carregar os restaurantes")

3. **Paginação**:
   - Se existem centenas de restaurantes na região, a API devolve em páginas
   - O app precisa pedir uma de cada vez (`?page=1&limit=20`)

4. **Segurança**:
   - O app precisa mandar junto o token de autenticação do usuário para provar que está autorizado

5. **Desempenho**:
   - Algumas informações podem ser guardadas em cache no app (como dados do restaurante) para não precisar pedir de novo a cada clique

### Resumindo com o iFood

O **consumo da API** é o aplicativo **pedindo dados ao servidor** e transformando as respostas em telas e funcionalidades para o usuário.

É graças a esse consumo que você consegue ver o cardápio, acompanhar a entrega em tempo real e receber notificações sobre o status do pedido.

---

## 3. Integração de APIs (como ligar sistemas diferentes)

A **integração** é quando **diferentes sistemas conversam entre si** usando APIs.

O iFood sozinho não consegue entregar toda a experiência: ele precisa se conectar com **restaurantes, entregadores, meios de pagamento e até serviços de mapa**. É nessa hora que as APIs fazem a ponte.

### Exemplos de Integração no iFood

#### 1. Pagamento
Quando você paga pelo app, o iFood chama a API de parceiros (ex.: Visa, MasterCard, Mercado Pago). A API confirma se o pagamento foi aprovado e devolve a resposta.

#### 2. Localização
Para mostrar a rota do entregador, o iFood usa a **API do Google Maps** ou de outro serviço de mapas. Assim consegue calcular a distância e estimar o tempo de entrega.

#### 3. Restaurantes
Alguns restaurantes usam sistemas próprios de gestão de pedidos. Esses sistemas recebem os pedidos automaticamente através da integração com a API do iFood, sem precisar digitar nada manualmente.

#### 4. Notificações (Webhooks)
Quando o status de um pedido muda (por exemplo, de "em preparo" para "a caminho"), o iFood envia automaticamente uma notificação ao restaurante ou ao cliente usando **webhooks**.

### O que é Importante na Integração

1. **Padronização**:
   - Todos os parceiros falam a mesma "língua" (JSON, HTTPS, endpoints bem definidos)

2. **Segurança**:
   - Cada sistema precisa de suas credenciais de acesso, evitando invasões

3. **Idempotência**:
   - Se o sistema de pagamento enviar duas vezes a confirmação, o iFood não pode registrar o pedido como pago em dobro

4. **Escalabilidade**:
   - A integração deve funcionar bem mesmo com milhões de pedidos sendo processados ao mesmo tempo

### Resumindo com o iFood

A **integração de APIs** é o que permite ao iFood juntar várias peças diferentes — **pagamento, mapa, restaurante e entregador** — para que, no fim, você consiga pedir uma pizza do sofá de casa e acompanhar até ela chegar à sua porta.

---

## Resumo Geral

| Conceito | Definição | Exemplo iFood |
|----------|-----------|---------------|
| **Implementação** | Criar a API no servidor | iFood programa endpoints para listar restaurantes, criar pedidos |
| **Consumo** | Usar a API (cliente) | App do cliente pede dados e exibe na tela |
| **Integração** | Conectar sistemas diferentes | iFood se conecta com pagamento, mapas, restaurantes |
