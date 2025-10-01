---
title: "Arquitetura de Software"
description: "Resumo sobre padrões e conceitos de Arquitetura de Software"
date: 2025-09-30
draft: false
---

# Arquitetura de Software

## O que é?

De acordo com Camila Pessôa: É a "Estrutura fundamental ou esqueleto de um sistema de software, que define seus componentes, suas relações e seus princípios de projeto e evolução".

Em resumo, nada mais é do que um esboço daquilo que é essencial no nosso sistema, e vem como consequência dos **Requisitos de software**.

---

## Para que serve?

Considerando o tópico anterior, depois de definidas as nossas prioridades/requisitos, precisamos saber como vamos encaixá-las e delimitá-las no nosso projeto.

### Analogia

Tal como um arquiteto faz um esboço de uma casa para saber os ambientes de:
- **Convivência** (sala de estar, cozinha)
- **Trabalho** (Escritório)
- **Descanso** (sala de estar e quartos)
- **Cuidado pessoal** (banheiro, lavabo)

Assim também o arquiteto de software deve fazer esse mesmo trabalho.

### Importante

Não necessariamente quer dizer que o computador vai construir um quarto dentro de um computador. Na verdade, por meio de técnicas de programação (como a **Programação Orientada a Objeto (POO)**, o uso de **bibliotecas**), poderemos fazer esse "desenho" do nosso sistema.

A junção deste com outras técnicas, gerará uma **Arquitetura Orientada a Serviços (SOA)**.

### Citação

Segundo Pessôa, "Sabemos que (a arquitetura de software) não se limita à design do software, ao código em si, bibliotecas, frameworks, hardware, metodologias ágeis ou princípios de desenvolvimento. No entanto, é interessante notar que todos esses elementos e escolhas são determinantes para definir uma boa arquitetura. [...] funciona como um 'tudo em todo lugar ao mesmo tempo' organizado a fim de evitar caos."

---

## Como faço?

Para aplicarmos, precisamos de **Padrões em arquitetura de software**, para facilitar nosso entendimento do código e evitar custos e desgastes desnecessários.

---

## Padrões de Arquitetura de Software

### 1. Arquitetura Client-Server

#### Client (desktop)
Responsável por manter a interface com o usuário e um ou outro código de aplicação. Delphi e VB são clientes do SQL, por exemplo.

#### Server (servidor)
Um banco de dados relacional. SQL é um exemplo. Aqui, existe a necessidade de, para evitar erros e procedimentos desnecessários, usarmos a arquitetura em camadas para evitar o acesso indevido e desnecessário do usuário a partes frágeis do sistema e manter 3 camadas de funcionamento simultâneo em que se precisa apenas de 1 dispositivo.

---

### 2. Layers (Arquitetura em Camadas)

Na arquitetura em camadas, o sistema é desenvolvido com camadas que são **independentes em termos de modificação**, mas a camada anterior é **dependente dos serviços e funcionalidades da camada atual**.

Ou seja, são parcialmente dependentes, pois o funcionamento de uma depende da próxima camada.

**Recomendada para:**
- Manutenção em softwares que já existem ("Você pegou o bonde já andando")
- Casos em que diferentes equipes desenvolvem de forma isolada cada parte do sistema

---

### 3. MVC (Mais Famosa)

Na arquitetura **Model-View-Controller (MVC)**, os sistemas são desenvolvidos nessas três camadas:

#### Model
Estabelece regras de negócio e a interação entre o back-end e o banco de dados (recepção ou envio de dados).

#### View
Define e gerencia como os dados são apresentados ao usuário (parte ligada fortemente ao front-end).

#### Controller
Responsável por ser o nível intermediário entre o model e o view, ao receber dados do usuário, e os manipula e reage de acordo com a necessidade do programador.

---

### 4. SOA (Arquitetura Orientada a Serviço)

Na arquitetura orientada a serviço, divide-se o sistema em **serviços independentes**, e depois, criam-se **interfaces** para que os serviços interajam entre si.

**Analogia:**

Estamos preparando um prato de almoço. Onde os serviços são, por exemplo:
- A região da proteína
- A região do carboidrato
- A fibrosa

A interface seria, portanto, a própria louça que abriga essas 3 regiões do seu prato de almoço.

---

### 5. Pipes and Filters

Nessa, o dado recebido pelo sistema e cada componente independente do sistema (chamado **filtro**), opera de forma específica dentro do filtro.

**Analogia:**

Se pensar no caso de se passar um café:
- O **dado** é o pó de café
- O **filtro** interage com o pó, de forma a transformar o pó em um café
- Para que o pó seja transformado em café, é preciso que o nosso líquido seja conduzido por um **duto**

**Exemplo de aplicação:**

Criar um agente de IA que identifica e-mails que são SPAM, já que o agente recebe o email, o manipula até que o simplifiquemos a ponto criar parâmetros simples para identificar spam.

---

### 6. Monolítica

Na arquitetura monolítica, criamos apenas um bloco onde os serviços são **interdependentes**, ou seja, sua manutenção é mais complexa.

A interação entre serviços/métodos é feita de forma **vertical**.

Pode haver modulação nesse tipo de sistema, para haver maior facilidade na manutenção do código.

**Exemplos famosos:** Amazon Prime Video e Github.

---

### 7. Baseada em Microsserviços

Considerada uma variante da arquitetura orientada a serviços, a arquitetura baseada em microsserviços é um tipo muito útil para arquitetura em que se busca uma **independência maior em termos de serviços**, e mais **descentralizada** do que a arquitetura monolítica.

---

### 8. Hexagonal

A arquitetura hexagonal é uma arquitetura conhecida por seu **desacoplamento e fácil manutenção**, pois há grande descentralização dos serviços.

#### Conceitos Principais

Segundo Pessôa: "As **portas** são as interfaces que permitem que a lógica de negócios se comunique com o mundo externo, e os **adaptadores** são responsáveis por implementar as portas."

#### Vantagens

Um ponto muito positivo dessa arquitetura é a possibilidade de se incrementar outras arquiteturas, devido ao grande desacoplamento.

No entanto, é preciso que tenhamos um **núcleo bem definido** para que a implementação dessa estrutura seja eficaz.

#### Perspectiva Diferente

Camila Pessôa acrescenta que: "Essa arquitetura traz uma perspectiva diferente sobre a ordem das camadas de uma aplicação, em que normalmente temos a primeira camada como a interface e a última como um banco de dados para armazenamento. A ideia é entender **front-end e back-end como camadas externas ao seu domínio!**"

---

## Fontes

- [Padrões Arquiteturais - Alura](https://www.alura.com.br/artigos/padroes-arquiteturais-arquitetura-software-descomplicada)
