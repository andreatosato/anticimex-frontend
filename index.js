import * as PIXI from 'pixi.js';

class PlanimetriaEntity {
  constructor(x, y, code, description, image) {
    this.proportionX = x;
    this.proportionY = y;
    this.code = code;
    this.description = description;
    this.image = image;
  }

  calculateX(maxWidth, maxXGraduate){
    this.x = (this.proportionX * maxWidth)/maxXGraduate;
    return this;
  }

  calculateY(maxHeight, maxYGraduate){
    console.log(maxHeight - ((this.proportionY * maxHeight)/maxYGraduate));
    this.y = maxHeight - ((this.proportionY * maxHeight)/maxYGraduate);
    return this;
  }
}

class Planimetria {
  constructor(width, height, readOnly) {
    this.dragging = false;

    let Application = PIXI.Application,
      Container = PIXI.Container,
      loader = PIXI.loader,
      TextureCache = PIXI.utils.TextureCache,
      Sprite = PIXI.Sprite,
      Rectangle = PIXI.Rectangle;

    // calcolare il ratio
    let ratio = Math.min(
      window.innerWidth / width,
      window.innerHeight / height
    );

    this.app = new Application({
      width: width,
      height: height,
      antialias: true,
      transparent: true,
      resolution: 1
    });

    this.cimexes = undefined;

    this.graphics = new PIXI.Graphics();
    this.app.stage.addChild(this.graphics);

    this.container = new PIXI.Container();
    if (!readOnly) {
      this.container.interactive = true;
      this.container.on('pointermove', this.onDragMove.bind(this));
    }
    // scale
    //this.container.scale.x = this.container.scale.y = ratio;
    this.app.stage.addChild(this.container);

    PIXI.Texture.fromURL(
      'https://raw.githubusercontent.com/andreatosato/anticimex-frontend/master/maps.png'
    ).then(tx => {
      let background = new PIXI.Sprite(tx);
      background.zIndex = -1;
      this.container.addChild(background);
    });

    this.style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 14,
      fill: ['#000000'],
      stroke: '#000000', //'#4a1850',
      strokeThickness: 0,
      dropShadow: false,
      wordWrap: true,
      wordWrapWidth: 440,
      lineJoin: 'round'
    });
    this.text = new PIXI.Text('init', this.style);
    this.text.x = Number.NaN;
    this.text.y = Number.NaN;
    this.app.stage.addChild(this.text);
  }

  setDragEndCallback(callback) {
    this.dragEndCallBack = callback;
  }

  drawPlanimetria(entities, cimexWidth = 10, cimexHeight = 10) {
    this.cimexes = entities;
    this.cimexes.forEach(c => {
      PIXI.Texture.fromURL(
        'https://image.flaticon.com/icons/svg/47/47059.svg'
      ).then(tx => {
        let cimex = new PIXI.Sprite(tx);
        cimex.code = c.code;
        cimex.interactive = true;
        cimex.buttonMode = true;
        console.log('draw ' + c.y);
        cimex.x = c.x;
        cimex.y = c.y;
        cimex.width = cimexWidth;
        cimex.height = cimexHeight;
        cimex.zIndex = 10;
        cimex.anchor.set(0.5);
        cimex
          .on('pointerdown', this.onDragStart.bind(this, cimex))
          .on('pointerup', this.onDragEnd.bind(this, cimex))
          .on('pointerupoutside', this.onDragEnd.bind(this))
          .on('pointerover', this.onButtonOver.bind(this, cimex))
          .on('pointerout', this.onButtonOut.bind(this));

        this.container.addChild(cimex);
      });
    });
  }

  onDragStart(cimex, event) {
    this.dragging = cimex.code;
    cimex.alpha = 0.5;
  }

  onDragEnd(cimex, event) {
    this.dragging = undefined;
    cimex.alpha = 1;
    // set cimexes changes
    let findCimex = this.cimexes.find(c => c.code === cimex.code);
    if (findCimex != undefined) {
      findCimex.x = cimex.x;
      findCimex.y = cimex.y;
    }

    if (this.dragEndCallBack) 
      this.dragEndCallBack(this.cimexes);
  }

  onDragMove(event) {
    if (this.dragging) {
      const cimex = this.container.children.find(c => c.code === this.dragging);
      let newPosition = event.data.getLocalPosition(this.app.stage);
      cimex.x = newPosition.x;
      cimex.y = newPosition.y;

      this.updateCimex(cimex);
    }
  }

  onButtonOver(cimex, event) {
    this.updateCimex(cimex);
  }

  onButtonOut() {
    this.updateCimex(undefined);
  }

  updateCimex(cimex) {
    this.graphics.clear();

    if (cimex) {
      const bounds = cimex.getBounds();

      this.graphics.lineStyle(2, 0xff00ff, 1);
      this.graphics.beginFill(0x650a5a, 0.25);
      this.graphics.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
      this.graphics.endFill();
      this.text.text = cimex.code;
      this.text.x = cimex.x;
      this.text.y = cimex.y;
    } else {
      this.text.text = undefined;
      this.text.x = Number.NaN;
      this.text.y = Number.NaN;
    }
  }

}

let dataCimexes = [
  new PlanimetriaEntity(10, 27, 'Mosca 1234')
    .calculateX(1700, 40)
    .calculateY(1300, 28),
  // new PlanimetriaEntity(12, 25, 'Mosca EFG')
  //   .calculateX(1700, 40)
  //   .calculateY(1300, 27),
  // new PlanimetriaEntity(15, 15, 'Mosca HGO')
  //   .calculateX(1700, 40)
  //   .calculateY(1300, 27),
  // new PlanimetriaEntity(2, 5, 'Mosca EFJ')
  //   .calculateX(1700, 40)
  //   .calculateY(1300, 27),
  // new PlanimetriaEntity(8, 2, 'Mosca YBN')
  //   .calculateX(1700, 40)
  //   .calculateY(1300, 28),
  // new PlanimetriaEntity(9, 19, 'Mosca PLN')
  //   .calculateX(1700, 40)
  //   .calculateY(1300, 28),

  //{x :135, y : 70, code : 'test'}
];

let plan = new Planimetria(1700, 1300, false);
document.body.appendChild(plan.app.view);
plan.drawPlanimetria(dataCimexes,10,10);

// vorrei ricevere i dati ogni volta che finisce il dragEnd
plan.setDragEndCallback(cx => console.log(cx));
