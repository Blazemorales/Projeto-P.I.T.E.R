---
title: "Resumo GitHub"
description: "Guia sobre repositórios, commits, branches, conflitos e pull requests"
date: 2025-09-30
draft: false
---

# Resumo GitHub

Este material apresenta os principais conceitos e comandos do Git e GitHub de forma prática e visual.

## 1º Passo: Criar e Conectar Repositórios

### Tipos de Repositório

- **Repositório remoto:** É o repositório online, no GitHub
- **Repositório local:** É o que criamos em nossa máquina

### Branch

Como se fosse **gestão que descreve as alterações do código** para decidir e testar, e só cloca na pasta principal (main) quando as alterações forem aprovadas.

### Comandos Iniciais

```bash
git init                          # Iniciarmos um repositório local
git branch -M main                # Assim criamos a "pasta principal"
git remote add origin url.git     # Com isso, conectamos o repositório
```

Nosso objetivo é criar um repositório no GitHub e depois criarmos um repositório local para assim conectar ambos. Para isso, no nosso terminal, após criar o repositório no GitHub, digitamos:

---

## 2º Passo: Criar Commits

### O que são Commits?

Arquivos com a letra `u`: Significa que **não está no repositório ou não está atualizado**.

Aqui precisamos verificar qual arquivo foi movido ou não, adicionar arquivos e enviá-los (commitar) com uma **mensagem** definindo o que muda com esse envio/atualização. Para isso, digitamos no terminal:

### Comandos de Commit

```bash
git status        # Para ver quais arquivos não estão atualizados no repo (não os em vermelho)
git add .         # Esse comando reencaminha os arquivos em vermelho no repositório local
git commit -m "mensagem"  # Aqui resumimos qual foi o update
git log           # Por último, aqui vemos os registros de commits
git push origin main      # Envia tudo acima do repositório local para o remoto
git pull origin main      # Baixar no seu repositório local as mudanças feitas no local
```

---

## Branch / Ramificações

### Merge

**Integrar uma branch qualquer em outra (mesclagem do código).**

### Comandos de Branch

```bash
git branch                    # Mostra as branchs que há no repositório remoto
git checkout -b nova_branch   # Assim, o checkout altera para a nova branch, e o -b cria
git checkout branch           # Muda para a branch escolhida
git merge branch              # Para unificar as branchs
```

> Tenho que estar na branch que será mesclada e executar a que quero mesclar.

```bash
git branch -d branch          # Exclui a branch do repositório local
git push origin branch --delete   # Exclui a branch do repositório remoto
```

---

## Padrões de Branchs

### GitFlow

#### Branchs principais

- **Main:** Código estável, passível de uso
- **Develop:** Código base p/ criação de outras branchs

#### Branchs de feature

Para implementar funcionalidades.

#### Branchs de release

Para fazer testes no código que entrará no develop, para depois mesclar com a main. Se caso os testes derem errado, voltamos para o Develop, corrigimos e retornamos à mesma até não ter mais erros e poder implementar o código na main. *Pode usar tags p/ cada versão.*

#### Branchs de hotfixes

Caso haja um problema crítico que precisa ser assumido rápido, criamos essa branch, resolvemos o erro e integramos no MAIN e no DEVELOP. *(em que impedirá de usar)*

---

### Trunk Based

Uma única branch, só cria uma outra se necessário. Usa uma sigla protege minoria, com menor pessoa.

---

## Conflitos

**Conflito** é quando duas pessoas fazem alteração na mesma parte do arquivo e na hora de commitar, o repositório local e o remoto não estão sincronizados.

Também acontece se tiver duas partes diferentes na mesma parte do arquivo, em branchs diferentes, e tenta mesclar uma delas na main.

### Para resolver o conflito:

```bash
git pull origin main
```

Assim atualizamos nosso repo local com o que estiver no repo local, e, na parte em conflito aparecerá dessa forma:

```
<<<<< HEAD
Alterações feitas no repo local
= = = = = = = = = = = = = = = = = = = = = = =
Alterações feitas no repo remoto
```

Aqui há três opções:
- Manter o local e excluir o remoto
- Manter o remoto e excluir o atual
- Manter ambas alterações

Após a correção:

```bash
git commit    # Para, após a correção poder commitar
git add .     # Logo em seguida adicionar as alterações
git commit    # Commitar sem mensagem, pois, nesse caso, o github coloca automático
git log       # Caso abra o Vim, assim o fecha e salva as alterações
```

---

## Issues

**Issues** é uma forma de organizar o projeto com checklists, determinando quando precisa fazer documentações, resoluções de bugs, adicionar funcionalidades, etc...

A issues fica nunca parte do GitHub.

### Elementos de uma Issue

- **Título:** Descrição breve
- **Descrição:** Explique em detalhes
- **Critérios de aceitação**
- **Prioridade:** Baixa, Média, Alta, Crítica
- **Tarefas:** Dividir em subtarefas
- **Notas Adicionais**
- **Milestone:** Aqui selecionamos em qual "versão" de issues ficarão
- **Assignees:** Aqui definimos os responsáveis
- **Labels:** Aqui ficam as tags para organizar cada issues
- **Comentários:** Nos comentários, atualizamos sobre a issues (Anotações, etc)
- **Mark as:** Na opção "Mark as" marcamos a issues como concluída

---

## Pull Request

São **registros de possíveis mudanças** que podemos fazer, assim, analisamos e testamos antes de integrar as branchs (uma boa prática).

### Fluxo do Pull Request

1. Branch que contém as mudanças
2. Aqui criamos o pull request
3. Aqui não apontados as alterações
4. Template para definir e registrar o pull request
5. A pull request fica registrada até disida fazer o merge
6. Por último, aqui farei o merge

**No final, cada pull request ficará registrada.**

---

## Conteúdo Visual

Este resumo é baseado em anotações manuscritas com diagramas e exemplos visuais da interface do GitHub, incluindo screenshots de:

- Interface de Issues
- Templates de Pull Request
- Comparação de mudanças (Compare changes)
- Sistema de labels e milestones
- Interface de merge

Para uma compreensão completa com exemplos visuais, consulte o [PDF original](/pdfs/resumo_github.pdf).

---

## Observações

Este material combina conceitos de Git/GitHub com boas práticas de desenvolvimento colaborativo, incluindo estratégias de branching (GitFlow e Trunk Based), gestão de conflitos e organização de projetos através de Issues e Pull Requests.
