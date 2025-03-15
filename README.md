# BARBERSHOP

## App

- https://barbershop-plum.vercel.app/

#### O Produto

![screen-splash](https://github.com/user-attachments/assets/740b2ede-8ad4-4283-b6af-c8a061ee8702)
![screen-login](https://github.com/user-attachments/assets/8a2aeaeb-56f8-4b23-b553-1158d8b92f04)

####

![Home (2)](https://github.com/user-attachments/assets/4ec321d6-8b1e-40b7-a241-d7f3cb7ad3e3)
![Services](https://github.com/user-attachments/assets/c5999f20-54be-4ef6-aad1-1472485e1de2)

####

![Calendary](https://github.com/user-attachments/assets/46a32a55-53ef-4fcc-85d3-b47be6c347d9)
![Confirm](https://github.com/user-attachments/assets/11076e19-a4c9-4a16-b0e5-7f20992463e6)

####

![My bookings](https://github.com/user-attachments/assets/66bdba4a-633f-4242-8f65-171e32599727)
![My bookings (1)](https://github.com/user-attachments/assets/f3c43baf-8b4c-4df6-b3f6-dd91632268ed)
![My bookings (2)](https://github.com/user-attachments/assets/397160ca-05f7-46f9-b549-45fe8026724c)

####

![Account](https://github.com/user-attachments/assets/9e3a8b56-8d5d-4973-aab3-f021690d71ba)
![Profile](https://github.com/user-attachments/assets/ec2350b0-7ccd-4118-b3b4-6f8ca015b502)
![Payments](https://github.com/user-attachments/assets/18361f72-38fe-455b-be91-9d0d618297af)

## Principais Tecnologias utilizadas

- Vite
- React
- daisyui
- Typescript
- Tailwindcss

## Instalação

- Clone o repositório com
  ```
  git clone https://github.com/Junior331/gta-ui.git
  ```
- É necessario ter o Node 22x ou superior instalado
- Para iniciar o servidor de desenvolvimento rode os comandos abaixo

```
yarn
yarn dev
```

### To do

- [x] Criar estrutura inicial do projeto
- [x] Implementação de Theme e Style
- [ ] Criar componentes
- [ ] Criar telas

  ### Pages

     - [X] Sign In

  ### Components

  ## Elements

     - [ ] Text  
     - [ ] Load  
     - [ ] Input 
     - [ ] Title 
     - [ ] Button

  ## Organism

  ## Modules

### Descrição da estrutura do projeto

- `Átomo (elements)`: Os átomos são componentes básicos e individuais, como botões, inputs, selects, etc. Um menu lateral geralmente é composto por diversos elementos, como ícones, textos, talvez até mesmo botões para navegação, e cada um desses elementos pode ser considerado um átomo. No entanto, o menu lateral como um todo é mais complexo do que apenas um único átomo.

- `Molécula (modules)`: As moléculas são compostas por átomos e têm uma funcionalidade mais complexa. Um menu lateral poderia ser considerado uma molécula se fosse composto por vários átomos (como botões, ícones, etc.) agrupados de uma maneira específica para uma função específica. No entanto, um menu lateral geralmente representa uma parte maior e mais significativa da interface do usuário.

- `Organismo (organism)`: Os organismos são componentes mais complexos que combinam vários átomos e/ou moléculas para formar uma parte significativa de uma interface. Um menu lateral se encaixa nessa definição, pois geralmente consiste em uma combinação de vários elementos (como itens de menu, ícones, títulos, etc.) agrupados para formar uma parte distinta e funcional da interface do usuário.

- `Hooks`: Os hooks são funções especiais que permitem que você use o estado e outros recursos do React dentro de componentes de função. Eles foram introduzidos no React 16.8 para permitir o uso de estado e outras funcionalidades anteriormente disponíveis apenas em componentes de classe em componentes de função.

- `Context`: A Context API é uma funcionalidade do React que permite compartilhar dados entre componentes sem a necessidade de passá-los explicitamente por meio de props. Ela é especialmente útil quando você tem dados que precisam ser acessados por muitos componentes em diferentes níveis da árvore de componentes. A Context API consiste em três partes principais: o provedor de contexto, o consumidor de contexto e o contexto em si.

- `Pages`: As páginas geralmente representam as diferentes rotas da aplicação, cada uma correspondendo a uma URL específica. As páginas são componentes que são renderizados quando o usuário navega para uma determinada rota. Elas são responsáveis por exibir o conteúdo relevante para essa rota específica e podem conter outros componentes, como formulários, listas, gráficos, etc. As páginas geralmente são compostas por uma combinação de componentes de apresentação e lógica, e podem ser estruturadas de acordo com as necessidades da aplicação.

- `Utils`: desempenha um papel crucial na organização e eficiência do código da aplicação. Ela abriga uma variedade de utilitários que são essenciais para diferentes partes da aplicação, ex: funções e arquivos auxiliares, como emptys, endpoints, types e funções auxiliares.

- `Styles (Theme)`: O tema do projeto é uma parte fundamental da estilização da aplicação, definindo as cores, estilos tipográficos e outros aspectos visuais que são aplicados em toda a interface do usuário. Abaixo, descrevo os principais elementos do tema:

### Estrutura do projeto

    ├── src/
    │   ├── assets/
    │   │   ├── icons/
    │   │   │   └── index.ts
    │   │   ├── images/
    │   │   │   ├── import-png.d.ts
    │   │   │   ├── import-svg.d.ts
    │   │   │   ├── placeholder.png
    │   │   │   ├── image_not_found.png.png
    │   │   │   └── index.ts
    │   ├── components/
    │   │   ├── elements/
    │   │   │   ├── Loading
    │   │   │   └── index.ts
    │   │   ├── modules/
    │   │   │   └── index.ts
    │   │   ├── organism/
    │   │   │   └── index.ts
    │   │   ├── templates/
    │   │   │   └── index.ts
    │   ├── contexts/
    │   ├── hooks/
    │   ├── lib/
    │   │   ├── provider.tsx
    │   ├── screens/
    │   │   ├── Home/
    │   │   ├── Signin/
    │   │   └── index.ts
    │   ├── services/
    │   │   └── services.ts
    │   ├── utils/
    │   │   ├── utils.ts
    │   │   ├── types.ts
    │   │   ├── emptys.ts
    │   │   └── endpoints.ts

- O diretório `src/` contém todos os componentes do projeto, organizados de acordo com o padrão atomic.
  Cada componente é classificado como `átomo (atom)`, `molécula (molecule)` ou `organismo (organism)`, conforme
  sua complexidade e reutilização.
