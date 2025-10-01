---
title: "Requisitos de Software"
description: "Material de estudo sobre Requisitos de Software"
date: 2025-09-30
draft: false
---

# Requisitos de Software

## Levantamento de Requisitos

Fase inicial e mais importante do desenvolvimento de software. Define:
- O que o cliente pode querer
- O que ele deseja
- As regras do negócio

### Importância

Necessário para:
- Identificar as necessidades do usuário
- Verificar a viabilidade
- Alocar funções para os membros do projeto
- Criar o modelo de sistema
- Estabelecer cronogramas e restrições

**Requisito**: declaração que descreve uma capacidade, característica ou restrição de um sistema de software, definindo seu comportamento.

### Identificação de Requisitos

Os requisitos são identificados a partir de:
- **Domínios de negócio**: contexto onde o projeto está sendo desenvolvido (ex: área médica)
- **Stakeholders**: pessoas interessadas (clientes, empresas, usuários)

### Problemas Comuns

- Comunicação do cliente com o analista
- Evolução dos Requisitos
- Gerenciamento de Alterações
- Falta de Conhecimento sobre o domínio

---

## Processo de Requisitos

### 1. Elicitação dos Requisitos
Comunicação com os stakeholders para determinar os requisitos

### 2. Análise dos Requisitos
Verificar se os requisitos são:
- Necessários
- Sem ambiguidades
- Possíveis de implementar
- Resolver problemas identificados

### 3. Registro dos Requisitos
Documentação dos requisitos (pode ser em casos de uso)

---

## Tipos de Requisitos

### Requisitos Funcionais (RF)

> Define **o que** um sistema deve fazer, suas interações com o usuário e outros sistemas.

**Características:**
- Mandatórios
- Visualizados em casos de uso
- Funcionalidade de Produto
- Relativamente fáceis de descobrir
- Descritos por verbos
- Necessidades do Negócio

**Exemplos:**
- O sistema deve permitir que os usuários pesquisem produtos por nome, categoria ou marca
- O sistema deve permitir que os clientes adicionem produtos a um carrinho de compras
- O sistema deve calcular o valor total da compra, incluindo frete e impostos
- O sistema deve processar pagamentos via cartão de crédito e boleto bancário
- O sistema deve enviar um e-mail de confirmação ao cliente após a conclusão de um pedido

### Requisitos Não-Funcionais (RNF)

> Define **como** o sistema deve realizar as suas funções (atributos de qualidade).

**Categorias principais:**
- Desempenho
- Escalabilidade
- Confiabilidade
- Portabilidade
- Usabilidade
- Segurança

**Características:**
- Não-mandatórios
- Atributos (Características)
- Propriedades do Produto
- Mais difíceis de descobrir
- Expectativas do negócio
- Normalmente mensuráveis

#### Subcategorias

**Requisitos de Produtos:**
- Requisitos de Usabilidade
- Requisitos de Eficiência
- Requisitos de Portabilidade
- Requisitos de Confiabilidade

**Requisitos Externos:**
- Requisitos de interoperabilidade
- Requisitos éticos
- Requisitos Legais

**Requisitos Organizacionais:**
- Requisitos de Entrega
- Requisitos de implementação
- Requisitos de padrões

**Exemplos:**
- Todas as senhas dos usuários devem ser armazenadas de forma criptografada no banco de dados
- O sistema deve bloquear um usuário após 3 tentativas de login malsucedidas
- O sistema web deve ser compatível com os navegadores Google Chrome, Mozilla Firefox e Microsoft Edge
- O sistema deve estar em conformidade com a Lei Geral de Proteção de Dados (LGPD)

---

## Comparação: RF x RNF

| Requisitos Funcionais | Requisitos Não-Funcionais |
|----------------------|---------------------------|
| Mandatórios | Não-mandatórios |
| Visualizados em casos de uso | Atributos (Características) |
| Funcionalidade de Produto | Propriedades do Produto |
| Relativamente fáceis de descobrir | Mais difíceis de descobrir |
| Descritos por verbos | - |
| Necessidades do Negócio | Expectativas do negócio |

---

## Técnicas de Levantamento

- **Workshops de Requisito**
- **Entrevistas com Stakeholders**
- **Questionários**
- **Brainstorms**
- **Prototipagem**
- **Etnografia**
- **JAD (Joint Application Design)**
- **Método VORD (Viewpoint-Oriented Requirements Definition)**

### JAD (Joint Application Design)

Técnica de levantamento de requisitos baseada em workshops colaborativos, onde usuários, analistas e desenvolvedores trabalham juntos para definir o sistema.

**Quando usar:** Quando há muitos stakeholders e necessidade de alinhamento rápido.

### VORD (Viewpoint-Oriented Requirements Definition)

Método orientado a pontos de vista (viewpoints), usado para estruturar os requisitos com base nas diferentes perspectivas dos stakeholders. Cada "viewpoint" representa uma perspectiva (ex.: cliente, administrador, sistema externo).

**Quando usar:** Em sistemas complexos, com múltiplos usuários e diferentes expectativas.

---

## Resumo Final

**Levantamento de Requisitos:** fase inicial e mais importante, onde se identificam as necessidades do usuário, regras de negócio, viabilidade e escopo do sistema.

**Problemas comuns:** comunicação deficiente com o cliente, evolução constante dos requisitos, gerenciamento de alterações e falta de conhecimento do domínio.

**Elicitação, Análise e Registro de Requisitos:** comunicação com stakeholders, verificação de viabilidade/clareza e documentação final.

**Requisitos Funcionais (RF):** descrevem o que o sistema deve fazer. Ex.: pesquisar produtos, adicionar ao carrinho, calcular compra, processar pagamento, enviar e-mail de confirmação.

**Requisitos Não-Funcionais (RNF):** descrevem como o sistema deve se comportar. Incluem desempenho, escalabilidade, confiabilidade, portabilidade, usabilidade e segurança.

**Técnicas para levantamento:** workshops, entrevistas, questionários, brainstorm, prototipagem, etnografia, JAD, VORD.
