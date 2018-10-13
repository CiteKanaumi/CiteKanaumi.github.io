// utf-8 width module ccchart.m.cssHybrid http://ccchart.com/

/* eslint-disable */
window.ccchart =
(function(window) {
  return {
    aboutThis: {
      name: 'ccchart',
      version: '1.12.088',//for ccy
      update: 20180612,
      updateMemo: 'http://ccchart.com/update.json',
      license: 'MIT',
      memo: 'This is a Simple and Realtime JavaScript chart that does not depend on libraries such as jQuery or google APIs.',
      demoCurrent: 'http://ccchart.com/',
      demoDevelopment: 'http://ccchart.org/',
      writer: 'Toshiro Takahashi @toshirot',
      see: 'http://www.facebook.com/javascripting',
      blog: 'https://web.archive.org/web/20160419064517/http://ngw.jp/~tato/wp/?cat=6',
      branched: ''
         + 'This project has branched from the jQchart, that made by Toshiro Takahashi '
         + 'jQchart is the jQuery plugin. since 2007. '
         + 'http://archive.plugins.jquery.com/project/jQchart',
      plugins:[]
    },
    m: [], //for plugins
    init: function init(id, op, callback) {
      //ccchart�̏�����
      this.drawing = false;
      var _c;
      if (('' + id.nodeName).toLowerCase() === 'canvas') {
        this.canvas = id;
        this.id = id.id;
      } else if(_c = document.getElementById(id)){
        this.canvas = _c;
        this.id = id;
      } else {
        throw new Error(''
          + 'Please check the ID. For example, '
          + 'spell, or single-byte and double-byte is different'
        );
      }
      if (typeof this.ids !== 'object') { //1th
        this.ids = []; //this.ids[id] canvas element by dom id
        this.cxs = []; //this.cxs[id] ctx by dom id
        this.coj = this.ops = []; //v1.11.07 renamed from ops to coj this.coj[id] is the 'this' of the id's ccchart oj.
        this.gcf = this.gcf || {}; //gloval config options
        this.wses = []; //�p�~�\��
          //websocket lists e.g. ccchart.wses['-ccchart-ws-'+id+'-'+url]
        this.wsuids = [];
          //websocket lists e.g. ccchart.wses['-ccchart-ws-'+uuidv4]
        this.wsidoj = {};
          //kye is id, value is websocket oj e.g. {'hoge1': wsoj, 'hoge2': wsoj}
        this.wsReCnt = []; //WebSocket re connect counter
          // e.g. ccchart.wsReCnt['-ccchart-ws-'+id+'-'+url]

        this.idsLen = 0;
        //this.defaultZindex = 0; //canvas��zIndex�@renamed from maxZindex is now option

        this.moveDly = 0; //move2 delay �����l
        this.moveStack = [];
        this.moveStackDly = [];

        this.cssgs = []; //CSS group lists
        this.cssTooltips = []; //CSS cssTooltips
      }
      //this.ops[this.id]�����ɑ��݂��Ă���
      if(this.ops[this.id]){
        //config�������ꍇ
        if(this.ops[this.id].op.config===op.config){
          //heatmap�̎��ɂ͎����`�擙���p�X����ׂɃt���O��true�ɃZ�b�g����
          this.ops[this.id].secondTime = true;
        }
      }


      if(typeof this._addsFlg === 'undefined'){
        this._addsFlg = 0; //undefined is before the init Method or drew the add Method
                           //0 is set in the init Method
                           //-1 is set in the add Method
                           //1 is first chart on use add method
                           //2 is second chart on use add method
      }

      for (var i in window.ccchart.m) {
        var isModule = !! i;
        break;
      };
      if (isModule){
        for (var i in this.m) {
          if(this.m[i]){
             this.moduleExtend(this, this.m[i], i, this.m[i].update);
          }
        }
      }
      this.callback = callback;
      this.idsLen++;

      var _curr_classNames =this.canvas.getAttribute('class');

      var _classNames = _curr_classNames?' '+_curr_classNames:'' ;

      if(_classNames.indexOf('-ccchart')===-1){
        this.canvas.setAttribute('class', '-ccchart' +_classNames);
      }
      this.ids[this.id] = this.canvas;
      this.ctx =
        this.cxs[this.id] =
        this.canvas.getContext('2d');
      if(!op.data)op.data = op.data || [[""],[""]];
      this.coj[this.id] = this.coj[this.id] || [];
       //unload reset. doesn't work on chrome
      if (window.ccchart['_added_unloadEvent'] !== 'on') {
        window.addEventListener('unload', function () {
          window.ccchart = null;
        });
        window.ccchart['_added_unloadEvent'] = 'on';
      }
      //css-hybrid���Z�b�g //���ƂŏC��
      var hybrid = document.getElementById('-ccchart-css-hybrid');
      if(hybrid){
        //���ʂ̃L�����o�X�ŏ���������flip��ws����groupbox�z�������Z�b�g���� 20130413 thanx nohina����
        var cssgbox = document.getElementById('-ccchart-css-groupbox');
        var cssg = document.getElementById('-ccchart-css-group-'+this.id)
        if(cssgbox && cssg) cssgbox.removeChild(cssg);
      }
      this.loadBranch(op, callback);
      return this;
    },
    preProcessing: function (op, callback) {
      //���O�Z�b�e�B���O
      if (!op) op = {};
      if (!this.gcf) this.gcf = {}
      if (!op.config) op.config = {};
      this.deep = op.config.deep || this.gcf.deep || 'yes';
      if(this.deep==='yes')op = this.util.deepJSONCopy(op);//deep copy
      this.op = op;
      this.display = op.config.display || this.gcf.display || this.canvas.style.display || 'block';
      this.canvas.style.display = this.display;
      this.width = this.util.setConfigNum(this, 'width', this.op.config.width, this.gcf.width, 600)
      this.height = this.util.setConfigNum(this, 'height', this.op.config.height, this.gcf.height, 400)
      this.bg = op.config.bg || this.gcf.bg || undefined;
      this.bgGradient = op.config.bgGradient || this.gcf.bgGradien || '';
      if (this.bgGradient === '' && this.bg === undefined) {
        this.bgGradient = {
          direction: "vertical", //vertical|horizontal
          from: "#687478",
          to: "#222"
        };
      }

      //�O���t�̎�� �܂��(line) �܂��� �_(bar)�Ȃ� swtGraph�Q��
      this.type = op.config.type || this.gcf.type || "line";

      //bar��stacked �`���[�g�̃c�[���`�b�v�͂�����Ɠ��ʂ�
      if(
        (op.config.useToolTip === 'yes' ||this.gcf.useToolTip === 'yes')
         && (this.type === 'bar' || this.type === 'stacked')){
        op.config.useMarker = 'css-maru';
         //�o�[�`���[�g�̃c�[���`�b�v�A���J�[�̐F
        this.barTipAnchorColor =
            this.op.config.barTipAnchorColor || this.gcf.barTipAnchorColor || 'rgba(0,0,0,0.7)';//'red'
      }

      //CSS�c�[���`�b�v
      this.useToolTip = op.config.useToolTip || this.gcf.useToolTip || 'no';

      //CSS���g�����ǂ���
      this.useCss = op.config.useCss || this.gcf.useCss || 'no';

      //�f�[�^�}�[�J�[��`�悷�邩 //none|arc|ring|maru|css-ring|css-maru
      this.useMarker = op.config.useMarker || this.gcf.useMarker || 'none';

      //�f�[�^�}�[�J�[��css-ring��css-maru�Ȃ玩���I��useCss = 'yes' ����pie
      if(this.useMarker === 'css-ring' || this.useMarker === 'css-maru'){
        if(!(this.type === 'pie' )){
          this.useCss = 'yes';
          this.useToolTip = 'yes';
        }
      } else {
        // css-maru��css-ring�����w��ł��c�[���`�b�v���g���Ȃ�useCss='yes'��css-maru���g��
        if(this.useToolTip === 'yes'){
          if(!(this.type === 'pie' )){
            this.useCss = 'yes';
          }
          this.useMarker = 'css-maru';
        }
      }
      //pie�Ƀ}�[�J�[�͎g��Ȃ�
      if(this.type === 'pie')this.useMarker = 'none';
      //�c�[���`�b�v�J�X�^�}�C�Y
      if(this.useToolTip === 'yes')
        this.tmpToolTip = op.config.tmpToolTip || this.gcf.tmpToolTip;

      //for drawLine, drawAmplitude
      //���� �f�t�H���g��2
      this.lineWidth = 
        this.util.setConfigNum(this, 'lineWidth', this.op.config.lineWidth, this.gcf.lineWidth, 2);
      //�����Z�b�g
      this.lineWidthSet = this.util.setLineWidthSet(this, op);

      //�}�[�J�[�̕��܂��͒��a
      this.markerWidth = this.util.setConfigNum(this, 'markerWidth', this.op.config.markerWidth, this.gcf.markerWidth)
      this.markerWidth = this.util.setConfigNum(this, 'markerWidth', this.markerWidth, this.lineWidth * 2 , 2)

      if(this.useCss === 'yes'){
        this.bind('scroll', '_adjustcsspos');
        this.bind('load', '_adjustcsspos');
        this.bind('resize', '_adjustcsspos');
      }
      //canvas��zIndex
      this.defaultZindex = this.util.setConfigNum(this, 'defaultZindex', this.op.config.defaultZindex, this.gcf.defaultZindex, 0)

      //�`���[�g�f�[�^�̗�ƍs��ϊ����邩
      this.changeRC = op.config.changeRC || this.gcf.changeRC || 'no';
      if(this.changeRC !== 'no'){
        op.data = this.util.changeRowsAndCols(op.data);
      }
      //��Ɨp�f�[�^
      this.wkdata = op.data || [];
      /*[
        ["Year", 2007, 2008, 2009, 2010, 2011, 2012, 2013],
        ["Tea", 435, 332, 524, 688, 774, 825, 999],
        ["Coffee", 600, 335, 584, 333, 457, 788, 900],
        ["Juice", 60, 435, 456, 352, 567, 678, 1260],
        ["Oolong", 200, 123, 312, 200, 402, 300, 512]
        ];*/

      //�f�[�^�z���1�s�ڂ����ږ��Ƃ���(�f�t�H���g��true)
       // scatter �ł͍��ږ��ł͂Ȃ����A�}��type���ʗp�Ɏg��
      this.useFirstToColName =
        (op.config.useFirstToColName === false)?false:
        ((this.gcf.useFirstToColName === false)?false:true);
      this.useFirstToColName =
        (this.useFirstToColName === false) ?
        ((this.type === 'scatter') ? true : false) : true;
      if(this.type === 'heatmap')this.useFirstToColName = false;

      if (this.wkdata.length === 1) this.useFirstToColName = false;
       //�f�[�^�z���1��ڂ����ږ��Ƃ���(�f�t�H���g��true)
      this.useFirstToRowName =
        (op.config.useFirstToRowName === false)?false:
        ((this.gcf.useFirstToRowName === false)?false:true);
      this.useFirstToRowName =(this.useFirstToRowName === false) ?
        false : true;

       //useFirstToColName��true�Ȃ�
       //�ŏ��̍s���J�������ږ��Ƃ��Ĕ����o��
      this.colNames =
        (this.useFirstToColName === true) ?
        this.wkdata.slice(0, 1)[0] : '';
      this.wkdata = this.data =
        (this.useFirstToColName === true) ?
        this.wkdata.slice(1) : this.wkdata;

       //useFirstToRowName��true�Ȃ�
       //�e�s�̍ŏ��̗���s�^�C�g���Ƃ��Ĕ����o��
      this.rowNames = [];
      this.data = [];
      if (this.useFirstToRowName === true) {
        //�ŏ��̗񂪍��ڗ�Ȃ�

        this.colNamesTitle = this.colNames.slice(0, 1)[0] || "";
        this.colNames = this.colNames.slice(1);
        for (var i = 0; i < this.wkdata.length; i++) {
          this.rowNames.push(this.wkdata[i][0]);
          this.data.push(this.wkdata[i].slice(1));
        }

      } else {
        //�ŏ��̗񂪍��ڗ�łȂ����

        this.colNamesTitle = "";
        if(this.useFirstToColName === true){
          //�ŏ��̍s�����ڍs�Ȃ�1��ڂ����o���Ȃ�
        } else {
          this.colNames = this.colNames.slice(1);
        }
        for (var i = 0; i < this.wkdata.length; i++) {
          this.rowNames.push("");
          this.data.push(this.wkdata[i]);
        }

      }

      /* ��L �u�f�[�^�z���1�s�ځv�Ɓu1��ځv�����ږ��Ƃ��Ď��o�������ʁA
         �擪�s�Ɨ��������data����сA���̃v���p�e�B�Ɣz�񂪍쐬����܂��B
        X�����x���̃^�C�g��  ccchart.colNamesTitle //"�N�x"
        X�����x���̔z��    ccchart.colNames
                //[2007, 2008, 2009, 2010, 2011, 2012, 2013]
        Y�����x���̔z��    ccchart.rowNames
                //["�g��", "�R�[�q�[", "�W���[�X", "�E�[����"]
      */

      this.hanreiNames = this.rowNames;
      this.useRow0thToHanrei =
        op.config.useRow0thToHanrei || this.gcf.useRow0thToHanrei || 'none';
      if (this.type === 'scatter' || this.type === 'heatmap') {
        this.colNamesTitle = this.rowNames[0] || ''; //X���^�C�g��
        this.rowNamesTitle = this.rowNames[1] || ''; //Y���^�C�g��
      }
      if (this.type === 'heatmap') {
        this.hanreiNames = '';
      }
      if (this.type === 'scatter') {
        if (this.useRow0thToHanrei === 'yes'){
          this.hanreiNames = '';
        } else {
          this.hanreiNames =
            this.util.uniq(this.colNames.slice(0));
            //hanrei�}�჊�X�g �C�� 20130413 Thanx piyo����
            //2014/5/2�܂�slice(1)�ɖ߂��Ă����̂�v1.08.5 �� �ďC��
        }
      }

      //�f�[�^�s��
      this.dataRowLen = this.data.length;
      //�f�[�^��
      this.dataColLen = this.data[0].length;

      //WebSocket��M���̍ő�f�[�^��
      this.maxWsColLen = this.util.setConfigNum(this, 'maxWsColLen', this.op.config.maxWsColLen, this.gcf.maxWsColLen, 10);

      //this.wsKeepAlive = this.op.config.wsKeepAlive || this.gcf.wsKeepAlive || true;

      //WebSocket�ڍ׃f�o�b�O�p�t���O
      this.wsDbg = this.op.config.wsDbg || false;
      //WebSocket�ڑ�/�ؒf��info�o�͗p�t���O
      this.wsInfo = this.op.config.wsInfo  || false;

      //�f�[�^��number��
      var _data =[];
      for(var i = 0;i< this.data.length; i++){
        _data[i]=[];
        for(var j = 0; j<this.data[i].length; j++){
          //null�Ȃǂ�0�ɂ��A�O���J���}�͏���
          _data[i][j] = parseFloat((''+this.data[i][j]).split(',').join('')||0)
        }
      }
      this.data = _data;

      //Y���ڐ��̃p�[�Z���g�\�����s�����ǂ���
      this.yScalePercent =
        this.op.config.yScalePercent || this.gcf.yScalePercent || 'no';

      //for drawStacked%
      if ((this.type === 'stacked%' || this.type === 'pie')
        && this.op.config.percentVal !='no' )this.op.config.percentVal = 'yes';
      this.percentVal =
          this.op.config.percentVal || this.gcf.percentVal || 'no';

      //for drawTitle, drawSubTitle
      //�^�C�g��������
      this.title = op.config.title || this.gcf.title || "";
      this.subtitle =
        op.config.subTitle || op.config.subtitle || this.gcf.subTitle || "";
      //�^�C�g����canvas�ɃZ�b�g����
      this.canvas.setAttribute('title', this.title);

      //�}����g�����ǂ���
      this.useHanrei =
        op.config.useHanrei || op.config.useHanrei || this.gcf.useHanrei || "yes";
      if(this.useFirstToRowName === false) this.useHanrei = "no";
      if(this.type === 'candle') this.useHanrei = "no";
      if(this.type === 'heatmap') this.useHanrei = "no";

      //X���ڐ��l�i���̖ڐ��j��\�����邩�H
      this.useXscale =
        this.op.config.useXscale || this.gcf.useXscale || "yes";

      //Y���ڐ��l�i���E�̖ڐ��j��\�����邩�H
      this.useYscale =
        this.op.config.useYscale || this.gcf.useYscale || "yes";

      //�`���[�g�݂̂�\��(�^�C�g��,�T�u�^�C�g��,X��Y���ڐ��l����) no|yes
      this.onlyChart = op.config.onlyChart || this.gcf.onlyChart || "no";
      this.onlyChartWidthTitle =
        op.config.onlyChartWidthTitle || this.gcf.onlyChartWidthTitle || "no";

      this.paddingDefault = op.config.paddingDefault || this.gcf.paddingDefault || 10;

      if (this.onlyChartWidthTitle === 'yes') {
        this.paddingBottomDefault =
          this.paddingLeftDefault =
          this.paddingRightDefault = this.paddingDefault;
        this.paddingTopDefault = 90;
        this.onlyChart = 'yes';
      } else if (this.onlyChart === 'yes') {
        this.paddingTopDefault =
          this.paddingBottomDefault =
          this.paddingLeftDefault =
          this.paddingRightDefault = this.paddingDefault;
      } else {
        this.paddingTopDefault = 90;
        if (this.title === '')
          this.paddingTopDefault = this.paddingTopDefault - 30;
        if (this.subtitle === '')
          this.paddingTopDefault = this.paddingTopDefault - 15;
        this.paddingBottomDefault = 40;
        this.paddingLeftDefault = 110;
        if (this.yScalePercent === 'no')
          this.paddingLeftDefault = 70;
        this.paddingRightDefault = 120;

        if(this._addsFlg > 0){
          //add���\�b�h���B�ʏ�� this.paddingDefault��10
          this.paddingRightDefault = 160;
        }
      }
      //�����`���[�g�ł͂Ȃ��ꍇ��XY���l���g��Ȃ��Ƃ��̓p�f�B���O�������� �����`���[�g�͑�ςȂ̂Ńp�X
      if(this._addsFlg === 0){
        if(this.useXscale !== 'yes'){
          this.paddingBottomDefault = this.paddingDefault +20;
        }
        if(this.useYscale !== 'yes'){
          this.paddingLeftDefault = this.paddingDefault +20;
        }
      }
      if(this.useHanrei !== 'yes'){//candle ��heatmap�� �}�Ⴊ����
        this.paddingRightDefault = 40;
        if(this._addsFlg > 0){
          this.paddingRightDefault = 110;
          this.paddingRightDefault = this.paddingLeftDefault;
        }
      }
      if (this.type === 'heatmap') {
        this.paddingBottomDefault = 55;
      }

      //�f�[�^�l��\��
      this.useVal = op.config.useVal || this.gcf.useVal || 'no'; //yes|no

      if (this.type === 'stacked%' &&
        this.useVal === 'yes') {
        this.paddingTopDefault = 90;
      }

      //for drawAxisX, drawAxisY, etc...
      //�O���t�̈�̃p�f�B���O
      this.paddingTop =
        op.config.paddingTop || this.gcf.paddingTop || this.paddingTopDefault;
      this.paddingBottom =
        op.config.paddingBottom || this.gcf.paddingBottom || this.paddingBottomDefault;
      this.paddingLeft =
        op.config.paddingLeft || this.gcf.paddingLeft|| this.paddingLeftDefault;
      this.paddingRight =
        op.config.paddingRight || this.gcf.paddingRight || this.paddingRightDefault;

      //�O���t�̈�̕�
      this.chartWidth =
        this.width - this.paddingLeft - this.paddingRight;
      //�O���t�̈�̍���
      this.chartHeight =
        this.height - this.paddingTop - this.paddingBottom;

      //�O���t�̈�̏�[
      this.chartTop = this.paddingTop;
      //�O���t�̈�̉��[
      this.chartBottom = this.height - this.paddingBottom;
      //�O���t�̈�̍��[
      this.chartLeft = this.paddingLeft;
      //�O���t�̈�̉E�[
      this.chartRight = this.width - this.paddingRight;

      //�[�����������̎w��i�������܂��͏�����n���ȉ����l�̌ܓ��Ŋۂ߂邽�߂̌��� int�j
      //�����_�ȉ��������w�肷��
      this.roundDigit = this.op.config.roundDigit;
      if(this.roundDigit === undefined)this.gcf.roundDigit;
      if(typeof this.roundDigit === 'number'){ //2, 0, 2.5, -3�Ȃ�
        this._useDecimal = 'yes';//2, 0, -3�Ȃ�
        this.roundDigit = parseInt(this.roundDigit);//�����Ȃ̂Ő�����
      } else {//undefined, null, '', [2], "2"
        //config�Ɏw�肪�Ȃ��ꍇ
        if(this.roundDigit === undefined){
          if(JSON.stringify(this.data).indexOf('.') !== -1){
            this._useDecimal = 'yes'; //config�Ɏw�肪�Ȃ����ǁA�����l���L��� yes�B
            this.roundDigit = 3;//�f�t�H���g�l 0.12345��0.123 1��0.1��0.12 �́A1��0.1��0.12�B
          } else {
	          this._useDecimal = 'no'; //config�Ɏw�肪�Ȃ���� no�B
	          this.roundDigit = 0;
          }
        } else {
          this._useDecimal = 'no'; //config�Ɏw�肪�Ȃ���� no�B������̐���'2'���_��
        }
      }

      //Y���̓V�n�𔽓]���� �f�t�H���g�� �~��'DESC'�@����'ASC' line,bezi2,bezi �̂�
      this.yScaleOrder =
        this.op.config.yScaleOrder || this.gcf.yScaleOrder || 'DESC';

      //X�ڐ��������_�L��ɂ��邩�H
      this.xScaleDecimal = this._useDecimal;
      //Y�ڐ��������_�L��ɂ��邩�H
      this.yScaleDecimal = this._useDecimal;

      //�f�t�H���g�͂����ł͂܂�undefined
      this.minY = this.util.setConfigNum(this, 'minY', this.op.config.minY, this.gcf.minY)
      this.maxY = this.util.setConfigNum(this, 'maxY', this.op.config.maxY, this.gcf.maxY)
      this.minX = this.util.setConfigNum(this, 'minX', this.op.config.minX, this.gcf.minX)
      this.maxX = this.util.setConfigNum(this, 'maxX', this.op.config.maxX, this.gcf.maxX)
      //maxY�@minY maxX minX �̏����l�͈ȍ~�Őݒ�
      this.maxYDefault = this.maxXDefault = 10;
      this.minYDefault = this.minXDefault = 0;
      
      //scatter heatmap���AmaxY �� maxX minX
      if (this.type === 'scatter' || this.type === 'heatmap') {

        //maxY�@minY
        if (typeof this.maxY === 'number') {
          this.maxY = this.maxY;
        } else {
          this.maxY = this.util.setConfigNum(this, 'maxY', _getSatterMax(this, 1), this.maxYDefault)//index0�@is X, 1 is Y
        }
        //�f�[�^�ő�lthis.maxY�̐؂�グ���� �f�t�H���gmaxY��1/10��
        if(this.yScaleDecimal !== 'yes')
          _setRoundedUpMax(this, 'maxY', 'roundedUpMaxY');

        if (typeof this.minY === 'number') {
          this.minY = this.minY;
        } else {
          this.minY = this.util.setConfigNum(this, 'minY', _getSatterMin(this, 1), this.minYDefault)//index0�@is X, 1 is Y
        }
        //maxX minX
        if (typeof this.maxX === 'number') {
          this.maxX = this.maxX;
        } else {
          this.maxX = this.util.setConfigNum(this, 'maxX', _getSatterMax(this, 0), this.maxXDefault)//index0�@is X, 1 is Y
        }
        if(this.xScaleDecimal !== 'yes')
          _setRoundedUpMax(this, 'maxX', 'roundedUpMaxX');

        if (typeof this.minX === 'number') {
          this.minX = this.minX || 0;
        } else {
          this.minX = this.util.setConfigNum(this, 'minX', _getSatterMin(this, 0), this.minXDefault)//index0�@is X, 1 is Y
        }

        function _getSatterMin(it, index){ //index0�@is X, 1 is Y
          var wk = it.util.hCopy(it.data[index]); //�n�[�h�R�s�[�@data[1]��Y
          return wk.sort(function (b, a) {
            return b - a
          })[0];
        }
        function _getSatterMax(it, index){ //index0�@is X, 1 is Y
          var wk = it.util.hCopy(it.data[index]); //�n�[�h�R�s�[�@data[1]��Y
          return wk.sort(function (a, b) {
            return b - a
          })[0];
        }
      } else {
        //scatter heatmap �ȊO�̃^�C�v
        //Y�f�[�^�̍ő�lmaxY�����߂�for drawYscale
        if (typeof this.maxY === 'number') {
          this.maxY = this.maxY;
        } else {
          this.maxY = this.util.setConfigNum(this, 'maxY', _getMax(this, 'maxY'), this.maxYDefault)
          
        }

        //maxY 100230 �Ȃǂ̎���110000 �ȂǑ傫���Ȃ肷����̂ňꎞ��~2017/3/25
        //�f�[�^�ő�lthis.maxY�̐؂�グ���� �f�t�H���gmaxY��1/10��
        //if(this.yScaleDecimal !== 'yes')
        //  _setRoundedUpMax(this, 'maxY', 'roundedUpMaxY');

        //�f�[�^�̍ŏ��l�����߂�
        if (typeof this.minY === 'number') {
          this.minY = this.minY;
        } else {
          this.minY = this.util.setConfigNum(this, 'minY', _getMin(this, 'minY'), this.minYDefault)
        }

        function _getMin(that, prop){
          //�f�[�^�̍ŏ��l�����߂�
          if( that.type==='line' ||
              that.type==='bar' ||
              that.type==='candle' ||
              that.type==='bezi2' ||
              that.type==='bezi' ||
              that.type==='area' ||
              that.type==='scatter' ||
              that.type==='heatmap' ||
              that.type==='ampli'){
            return that.util.getMin(that);
          } else if(that.type === 'stacked'){
            //stacked�̓}�C�i�X�����̐ςݏグ�ŏ��l
            return that.util.getMinSum(that);
              //��stacked%��minY��0%, stackedarea�͂��܎����ɂ��ĂȂ����ǂǂ�����H
          }
        }
        function _getMax(that, prop){
          //�f�[�^�̍ő�l�����߂�
          if(that.type === 'stacked' ||
             that.type === 'stackedarea' ||
             that.type === 'stacked%'){

            //�ςݏd�˂����̍ő�l�@��stacked�̓v���X�����̐ςݏグ�ő�l
            return that.util.getMaxSum(that);

          } else {
            return that.util.getMax(that);
          }

        }

      }

      //���ꂨ������? 2017/3/25
      function _setRoundedUpMax(that, max, roundedUp) {
          //�f�[�^�ő�lthis[maxY|maxX]�̐؂�グ���� �f�t�H���gmaxY�܂���maxX��1/10��
          if (that.yScalePercent === 'no') {
            var _rumy = Math.pow(10, ("" + that[max]).split('.')[0].length - 2);
            //�f�t�H���gmaxY|maxX��1/10��
            that[roundedUp] =
              (op.config[roundedUp] !== undefined) ?
              op.config[roundedUp] : _rumy;
            if (that[roundedUp] !== 0) {
              that[max] = Math.ceil(
                that[max] / that[roundedUp]) * that[roundedUp];
            } else {
              that[max] = that[max];
            }
          }
      }
        
      //�����ڐ����AxisX�̖{��
      if(typeof this.op.config.axisXLen === 'number'){
        this.axisXLen = this.op.config.axisXLen;
      } else {
        if(typeof this.gcf.axisXLen === 'number'){
          this.axisXLen = this.gcf.axisXLen;
        } else {
          this.axisXLen = 10; //default

          //Y�ڐ��������_������ (this.maxY - this.minY) < axisXLen �Ȃ�
          //�����ڐ�����̐��� (this.maxY - this.minY +1)�܂Ō��炷
          if(this.yScaleDecimal === 'no'){
            //if((this.maxY - this.minY) <  this.axisXLen) this.axisXLen = parseInt((this.maxY - this.minY+1));
            if((this.maxY - this.minY) <  this.axisXLen) this.axisXLen = parseInt((this.maxY - this.minY));
          }
        }
      }

       //�����ڐ���1�{������̃��x���l
      this.yGapValue = (this.maxY - this.minY) / (this.axisXLen);
      //yGapValue���[���Ȃ珬��1�ʂ�_useDecimal���Đݒ�
      //if((''+this.yGapValue).indexOf('.') !== -1 && this.roundDigit !== undefined){
        //Y�ڐ��������_�L���1�ʂɂ���
      //  this.yScaleDecimal = this._useDecimal = 'yes';
      //  this.roundDigit = 1;
      //}
      //�l1������̍���
      this.unitH = this.chartHeight / (this.maxY - this.minY);
      if(isFinite(this.unitH) === false){
        this.unitH = this.chartHeight;
        //0�Ŋ����Infinity�ɂȂ��Ă��܂��̂�Y�l�̕ω����Ȃ��ꍇ�̂悤��0�Ȃ�chartHeight�ɂ��Ă���
      }

      if (this.type === 'stacked%') this.unitH = this.chartHeight / 100;
       //���x���̒l�����l
      this.wkYScale = this.minY;

      //for drawAxisX
      //�����ڐ����p
      this.yGap = this.chartHeight / (this.axisXLen);

      //for drawAxisY
      //�����ڐ����p
      this.axisYLen = this.dataColLen//�{��
      this.xGap = (this.chartWidth)/this.axisYLen  ;//�ڐ����̊Ԋu

      //X���̐F Y���̐F
      this.xColor = op.config.xColor || this.gcf.xColor || 'rgba(180,180,180,0.3)';
      this.yColor = op.config.yColor || this.gcf.yColor || 'rgba(180,180,180,0.3)';

      //scatter heatmap���́AaxisYLen xGap xGapValue unitW wkXScale
      if (this.type === 'scatter' || this.type === 'heatmap') {


        //for drawAxisY for scatter
        //scatter���̐����ڐ����p
        this.axisYLen =
          this.op.config.axisYLen || this.gcf.axisYLen || 10; //�{��
        this.xGap = (this.chartWidth) / this.axisYLen; //�ڐ����̊Ԋu

        //�����ڐ���1�{������̃��x���l
        this.xGapValue = parseFloat((this.maxX - this.minX) / this.axisYLen, 10);
        //�l1������̕�
        this.unitW = this.chartWidth / (this.maxX - this.minX);
        //���x���̒l�����l
        this.wkXScale = this.minX;
      }

      //�ʒu�L�^�preadonly psition left��top��Ԃ� axisYs��yTitle�ł��̗�̃^�C�g�����Ԃ�
      this.axisYs = [];
      //[{left: 70, yTitle: "�N��"},{left: 206.66666666666666,yTitle: 2014},{left: 343.3333333333333,yTitle: 2015},...]
      this.axisXs = [];
      //[{top: 360}, {top: 333},{top: 306}]


      //for drawLine, drawHanrei
      //�J���[�Z�b�g
      this.colorSet = op.config.colorSet || this.gcf.colorSet ||
      ["red","#FF9114","#3CB000","#00A8A2","#0036C0","#C328FF","#FF34C0",
      "#F33","#FB4","#3E3","#0EE","#07E","#C7F","#F7E",
      "#F66","#FD7","#3F7","#3EE","#0AE","#CAF","#FAF",
      "#F99","#FEA","#3FF","#4FF","#0DF","#DCF","#FDF"];//default 28color
      //������J���[
      this.textColor = op.config.textColor || this.gcf.textColor || false;
      this.textColors = op.config.textColors || this.gcf.textColors ||{
        "title" : "#ccc",
        "subTitle": "#ddd",
        "x": "#aaa",
        "y": "#aaa",
        "hanrei": "#ccc",
        "unit": "#aaa",
        "memo": "#ccc"
      }
      if(this.textColors){
        this.textColors.all = this.textColors.all || undefined;
      } else if(this.gcf.textColors){
        this.textColors.all = this.gcf.textColors.all || undefined;
      }

      if(this.type === 'heatmap'){
        this.hm_grad = op.config.hm_grad || this.gcf.hm_grad  || undefined;
        this.innerCircle = 
          this.util.setConfigNum(this, 'innerCircle', this.op.config.innerCircle, this.gcf.innerCircle, 1);
        this.outerCircle= 
          this.util.setConfigNum(this, 'outerCircle', this.op.config.outerCircle, this.gcf.outerCircle, 30);
      }

      //for drawHanrei
      //�}��}�[�J�[�̌` arc|rect
      this.hanreiMarkerStyle =
        op.config.hanreiMarkerStyle || this.gcf.hanreiMarkerStyle  || 'arc';

      //�~�O���t�̃h�[�i�c���̔��a
      this.pieHoleRadius = 
        this.util.setConfigNum(this, 'pieHoleRadius', this.op.config.pieHoleRadius, this.gcf.pieHoleRadius, 40);
      //�~�O���t�̃h�[�i�c��
      this.pieRingWidth = 
        this.util.setConfigNum(this, 'pieRingWidth', this.op.config.pieRingWidth, this.gcf.pieRingWidth, 40);

      //�_�O���t�p�p�����[�^
      this.barWidth = 
        this.util.setConfigNum(this, 'barWidth', op.config.barWidth, this.gcf.barWidth, 10);
      this.barPadding = (op.config.barPadding!==undefined)?op.config.barPadding:
                          (this.gcf.barPadding!==undefined)?this.gcf.barPadding:
                            undefined;
      this.barGap = op.config.barGap || this.gcf.barGap || 1;

      //�P�ʂ�\��
      this.unit = op.config.unit || this.gcf.unit || '';

      //�L�����o�X��]�G�t�F�N�g�̕��� x|y
      this.flipDirection =
        op.config.flipDirection || this.gcf.flipDirection  || 'x';

      //X���ɃJ�X�^��X���C��-�������A����Y�l��\������
      this.xLines = op.config.xLines || this.gcf.xLines || 'none' ||[{
        "color":"rgba(204,153,0,0.7)",  //���C���F
        "width":"1",   //���C����
        "val":0,     //Y�l
        "vColor":"rgba(204,153,0,0.7)",//�l�F
        "xOffset": 2,  //X�����I�t�Z�b�g
        "yOffset": 4,  //Y�����I�t�Z�b�g
        "fillOver": null, //���C����̓h��F
        "fillUnder": null, //���C�����̓h��F
        "keep": "no" //�ő�l���ŏ��l�ňʒu���L�[�v���邩�H"high" || "low" || (default)"no"
      }];
      //memo
      this._memo = op.config.memo || this.gcf.memo || null;
      //image
      this._img = op.config.img || this.gcf.img || null;
      this.imgAlpha = op.config.imgAlpha || this.gcf.imgAlpha || 1;

      //�e��t���邩�ǂ���
      this.useShadow =  op.config.useShadow || this.gcf.useShadow || 'yes';
      if(this.useShadow === 'yes'){
        this.shadows = op.config.shadows || this.gcf.shadows ||{
        "hanrei" : ['#222', 5, 5, 5],
        "xline": ['#444', 7, 7, 5],
        "line": ['#222', 5, 5, 5],
        "bar": ['#222', 5, 5, 5],
        "stacked": ['#222', 5, -5, 5],
        "stackedarea": ['#222', 5, 5, 5],
        "bezi": ['#222', 5, 5, 5],
        "bezi2": ['#222', 5, 5, 5],
        "scatter": ['#222', 5, 5, 5],
        "heatmap": ['#222', 5, 5, 5],
        "pie": ['#444', 3, 3, 3]
        }
        if(this.shadows)
          this.shadows.all = this.shadows.all ||
            (this.gcf.shadows?this.gcf.shadows.all:undefined) || undefined;
      }

       //forCSS prifix
       this.ua = navigator.userAgent.toLowerCase();
       this.prefix = this.ua.match(/webkit/)?'-webkit':
            this.ua.match(/firefox/)?'-moz':
            this.ua.match(/opera/)?'-o':'-ms';
       this.pfx =[];
       this.util.setPfx('transform'); //this.pfx['transform']
       this.util.setPfx('transform-origin'); //this.pfx['transform-origin']
       this.util.setPfx('transition'); //this.pfx['transition']
       this.util.setPfx('box-sizing'); //this.pfx['box-sizing']

       this.borderWidth =
        this.util.setConfigNum(this, 'borderWidth', op.config.borderWidth, this.gcf.borderWidth, 3);

       //copy the preProcessing data to ids.
       this.cojLen = 0;
       for(var i in this){
         this.coj[this.id][i] = this[i];
         this.cojLen++;
       }

       this.coj[this.id].targetPos = null;//for adjustCss

       if(this.useCss==='yes')
         if(this.useCssSetting)this.useCssSetting(op);

       this.ondrew = callback || function(){};
       if(
         this._addsFlg !== -1
       )
       this._ondrew = this._ondrew_old = function(that){
         that.drawing = false;
         if (that.useCss === 'yes') that.adjustCss('drew', that.id, that.type);
         if (that.ondrew)this.ondrew(that);
       };

       this.draw(op);

    },
    get: function (url, fnc, async) {
      var that = this;
      var async = (async === false) ? false : true;
      var req = new XMLHttpRequest();
      req.open('GET', url, async);
      req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      req.setRequestHeader('Pragma', 'no-cache'); //for IE. 20130423 Thanx �v�ۓc �p�W����
      req.setRequestHeader('Cache-Control', 'no-cache');
      req.onreadystatechange = function (evt) {
        if (req.readyState == 4 && req.status == 200) {
          if (req.responseText === '') return req
          var res = decodeURIComponent(req.responseText);
          if (fnc) fnc(res);
        }
      };
      req.send();
      return req;
    },
    bind: function (type, fnc) {
      var it = this;
      var target = this.canvas;
      //for iphone android
      if (type === 'click' || type === 'touchstart') {
        var mbl = this.util.isMobile();
        type = (mbl) ? 'touchstart' : 'click';
      }
      // this is for ccchart.$(function(){});
      //   and ccchart.bind('load', function () {});
      if (typeof this.ids !== 'object') {
        target = window;
      }
      if (fnc !== '_adjustcsspos') {
        if (typeof fnc === 'function') {
          target.removeEventListener(type, function (e) {
            fnc.call(it, e, it.canvas);
          });
          if (type === 'load') {
            fnc.call(it, window.event, it.canvas);
          } else {
            target.addEventListener(type, function (e) {
              fnc.call(it, e, it.canvas);
            });
          }
          if (this.useCss === 'yes' && this.hybridBox) {
            this.hybridBox.addEventListener(type, function (e) {
              fnc.call(it, e, it.canvas);
            });
          }
        }
      }

      //for CSS Hybrid AdjustCss
      if (this.useCss !== 'yes') {
        return this;
      } else {
        if (type === 'load') {
          setAdjustCssEvent(this, window, 'load');
        }
        if (type === 'resize') {
          setAdjustCssEvent(this, window, 'resize');
        }
        if (type === 'scroll') {
          setAdjustCssEvent(this, document, 'scroll');
        }
      }
      function _a() { it.adjustCss(type) }
      function setAdjustCssEvent(that, target, type) { //�d���o�^��h��
        if (that['_added_css_' + type + 'Event'] !== 'on') {
          target.addEventListener(type, _a);
          that['_added_css_' + type + 'Event'] = 'on';
        }
      }
      return this;
    },
    $: function(func){
      if(typeof func === 'function')this.bind('load', func);
    },
    draw: function (op) {

      //�q�[�g�}�b�v�̎���WS���ȂǂɎ��Ȃǂ̃`���[�g�x�[�X���ĕ`�悵�Ȃ�
      if(this.ops[this.id].secondTime && this.type === 'heatmap'){
        this.drawHeatmap();
        this.ops[this.id].secondTime = false;
        return;
      }

      //�`�惁�\�b�h
      this.drawing = true;
      if (this._addsFlg === 0 || this._addsFlg === 1) {
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.ctx.scale(1, 1);
        this.ctx.translate(0, 0);

        this.ctx = this.util.setDefaultCtxProps(this, 'font',  "100 12px 'Arial'");

        if (this.bgGradient) this.drawGradient();
        else if (typeof this.bg === 'string') this.drawBG();

        if (this.type !== 'pie') {
          if(this._addsFlg === 0){
            //add�ȊO�̒ʏ폈��
            this.drawAxisX();//�����ڐ����Ɛ��������x��
            this.drawAxisY();
          } else if(this._addsFlg === 1){
            //add����first chartY���ڐ���͏����Ă���
            this.drawAxisX();//�����ڐ����Ɛ��������x��
          }
        } else {
            if(this._addsFlg === 1){
              //add��
              this.drawAxisX();//�����ڐ����Ɛ��������x��
              this.drawAxisY();
            }
        }

        if (this.onlyChart === 'no' || this.onlyChartWidthTitle === 'yes')
          this.drawTitle();
        if (this.onlyChart === 'no') this.drawSubTitle();
      } else if (this._addsFlg === 2) {
        //add����second chartXY��
        this.drawAxisX();//�����ڐ����Ɛ��������x��
        this.drawAxisY();//�����ڐ����Ɛ��������x��

      }

      if (this.onlyChart === 'no' &&  this.useHanrei !== 'no') this.drawHanrei();
      if (typeof this._img === 'object') {
          this.drawImg(this._img);
      }
      if (typeof this._memo === 'object') {
        this.drawMemo();
        //this.drawImg���������W�ɂ���Ƃ����炪
        //�R�[���o�b�N�x������̂Ń����������Ȃ��Ȃ�
      }
      if (this.unit !== '') this.drawUnit(this);
        //drawUnit��swtGraph�ɂ��ondrew�̑O�ɏ����Ȃ���add���\�b�h�� addsFlg�����Z�b�g����Ă��܂�
      if (op) this.swtGraph();
      if (
        this.useMarker !== 'none' &&
        !(this.type === 'scatter' || this.type === 'heatmap')
      ) this.drawMarkers();
      if (this.xLines !== 'none') this.drawXLine();
    },

    swtGraph: function () {
      //�`���[�g�^�C�v����
      switch(this.type){
        case('line')  : this.drawLine ();break;
        case('bar')   : this.drawBar ();break;
        case('pie')   : this.drawPie();break;
        case('bezi')  : this.drawbeziLine();break;
        case('bezi2')  : this.drawbeziLine2();break;
        case('stacked') : this.drawStackedBar();break;
        case('area')   : this.drawArea();break;
        case('stackedarea')   : this.drawStackedArea();break;
        case('stacked%')   : this.drawStackedPercent();break;
        case('ampli')   : this.drawAmplitude();break;
        case('scatter')   : this.drawScatter();break;
        case('heatmap')   : this.drawHeatmap();break;
        case('candle') : this.drawCandle();break;
        default     : this.drawBar ();break;
      }
    },
    drawBG: function(bg){
      if(typeof bg === 'string')this.bg=this.op.config.bg=bg;//����������Ώ㏑������
      if(this.canvas.style ){
        this.canvas.style.setProperty ("background-color", (this.bg), '');
      }
      //fillRec����boder-radius�����邪���ƂōČ���
      //  this.ctx.fillRect(0, 0, this.width, this.height);
      return this;
    },
    drawGradient: function () {

      var bg = this.bgGradient;
      var y = (bg.direction==='vertical')?this.height:0;
      var x = (bg.direction==='horizontal')?this.width:0;
      var lingrad = this.ctx.createLinearGradient(
        0, 0, x, y
      );
      lingrad.addColorStop(0, bg.from);
      lingrad.addColorStop(1, bg.to);
      this.ctx.fillStyle = lingrad;
      this.ctx.fillRect(0, 0, this.width, this.height);
      return this;
    },
    drawAxisX: function () {
      //�����ڐ����Ɛ��������x��

      var that = this;

      //�����ڐ����̕� �f�t�H���g��1 �����I��0���w�肷��Ɛ����ڐ����\������
      this.axisXWidth = this.util.setNumberOfConfigVal(this, 'axisXWidth', 1);
      var _axisXWidth = this.axisXWidth;


      //�����ڐ������~���Ȃ牺�ӂ���`���Ă��� yScaleOrder�̏���
      if(this.type === 'line' || this.type === 'bezi2' || this.type === 'bezi'){
        if(this.yScaleOrder === 'ASC'){
          //line����Y���ڐ������\�@yScaleOrder
          for (
              var top = this.chartTop, count = 0;
              top <= this.chartBottom;
              top += this.yGap, count++
            ) {
           _doit (top, count)
          }
        } else {
          for (
              var top = this.chartBottom, count = 0;
              top >= this.chartTop;
              top -= this.yGap, count++
            ) {
           _doit (top, count)
          }
        }
      } else {
          for (
              var top = this.chartBottom, count = 0;
              top >= this.chartTop;
              top -= this.yGap, count++
            ) {
           _doit (top, count)
          }
      }

      function _doit ( top, count) {
        //�������̈ʒu
        that.axisXs.push({top:top});


        if(that.wkYScale === 0){
          //Y�l��0�Ȃ班����������
          that.axisXWidth = _axisXWidth + 2;
        } else {
          that.axisXWidth = _axisXWidth;
        }

        //add�Ȃ��Ȃ�0�Badd����Ȃ�1�BaxisXWidth��0�ȏ�ŕ`��
        if(  that._addsFlg < 2 && that.axisXWidth >0 ){
          that.ctx.beginPath();
          that.ctx.lineWidth = that.axisXWidth;
          that.ctx.strokeStyle = that.xColor;
          that.ctx.moveTo(that.chartLeft, top);//���C���`��J�n
          that.ctx.lineTo(that.chartRight, top);//���C���`��I��
          that.ctx.stroke();
        }
        //Y�����̐��������x���`���
        if(that.type !=='pie')
        if(that.onlyChart==='no'){
            that.drawYscale(top, count);
        }
      }
      return this;
    },
    drawAxisY: function () {
      //�����ڐ����Ɛ��������x��

      //�����ڐ����̕� �f�t�H���g��1 �����I��0���w�肷��Ɛ����ڐ����\������
      this.axisYWidth = this.util.setNumberOfConfigVal(this, 'axisYWidth', 1);

      //�����ڐ����̃X�L�b�v�� �f�t�H���g��0
      this.xScaleSkip = this.util.setNumberOfConfigVal(this, 'xScaleSkip', 0);

      //�����ڐ��X�L�b�v���̕� //�f�t�H���g��3
       this.axisYSkipWidth = this.util.setNumberOfConfigVal(this, 'axisYSkipWidth', 3);

      var _axisYWidth = this.axisYWidth;
      for (
        var left = this.chartLeft, count = 0;
        left <= this.chartRight;
        left += this.xGap, count++
        ) {

          //�������̈ʒu�Ƃ���ɑΉ�����f�[�^��̃^�C�g��
          //@see test Array http://ccchart.org/test/realMemo/test1.htm
          this.axisYs.push({left:left, yTitle:this.op['data'][0][count]});

          if(this.xScaleSkip >0){
            if(count % this.xScaleSkip === 0){
              _axisYWidth=this.axisYSkipWidth;
            } else {
              _axisYWidth=this.axisYWidth;
            }
          }

          //_axisYWidth��0�ȏ�ŕ`��
          if(_axisYWidth > 0 ){
            this.ctx.beginPath();
            this.ctx.lineWidth  = _axisYWidth;
            this.ctx.strokeStyle = this.yColor;
            this.ctx.moveTo(left, this.chartTop);//���C���`��J�n
            this.ctx.lineTo(left, this.chartBottom);//���C���`��I��
            this.ctx.stroke();
          }

          //X�����̐��������x���`���
          if(this.type !=='pie'){
            if((this.useFirstToColName && this.onlyChart==='no')||
              this.type==='heatmap'//heatmap��useFirstToColName������ [[X,..],[Y,..]]
            ){
              if(this.xScaleSkip!==0){
                  if(count % this.xScaleSkip === 0){
                    this.drawXscale(left, count);
                  }
              } else {
                this.drawXscale(left, count);
              }
            }
          }
      }
      return this;
    },
    drawXscale: function (left, count){
      if( this.useXscale==='no')return this;
      if(!(this.type==='scatter'||this.type==='heatmap')){
        if(!this.colNames[count])return this;
      }
      this.ctx.save();
      var xScaleDecimal = this.xScaleDecimal;
      var xScaleColor =
        this.op.config.xScaleColor || 
        this.gcf.xScaleColor ||
        this.textColor || 
        this.gcf.textColor ||
        this.textColors.all ||
        (this.gcf.textColors?
          this.gcf.textColors.all:(this.textColors.x || this.gcf.x)) ||
          "#aaa";
      var xScaleFont =
        this.op.config.xScaleFont || this.gcf.xScaleFont;
      var xScaleAlign =
        this.op.config.xScaleAlign || this.gcf.xScaleAlign || "center";
      var xOffset =
        this.util.setConfigNum(this, 'xScaleXOffset', this.op.config.xScaleXOffset, this.gcf.xScaleXOffset, 0);
      var yOffset =
        this.util.setConfigNum(this, 'xScaleYOffset', this.op.config.xScaleYOffset, this.gcf.xScaleYOffset, 22);

      this.colNamesTitleOffset =
        this.util.setConfigNum(this, 'colNamesTitleOffset', this.op.config.colNamesTitleOffset, this.gcf.colNamesTitleOffset, 15);
      var tcXOffset =
        this.op.config.colNameXTitleOffset || this.gcf.colNameYTitleOffset || this.colNamesTitleOffset;

      var tcYOffset =
        this.op.config.colNameYTitleOffset || this.gcf.colNameYTitleOffset || this.colNamesTitleOffset;
        //rowNameTitleXOffset �� rowNameTitleYOffset ������������ǂ�����
      if(this.type==='heatmap'){
        tcXOffset -= this.width/2;
      }

      var xScaleRotate =
        this.util.setConfigNum(this, 'xScaleRotate', this.op.config.xScaleRotate, this.gcf.xScaleRotate, 0);

      if(this.type==='scatter'||this.type==='heatmap'){
        var val = '', percent = '';
        if(left >= this.chartRight){this.wkXScale = this.maxX}//�����C�����Ƃōčl
        val = this.util.addComma(this, this.wkXScale, xScaleDecimal);
        percent = (this.xScalePercent==='yes')?( ' ('+ count * 10 +'%)' ):'';
        this.wkXScaleStr = val + percent;//change type to string
      }

      var xWkOffset =
        (this.type==='scatter'||this.type==='heatmap')?0:this.xGap/2 - xOffset;
      if(xScaleFont)this.ctx.font = xScaleFont;
      if(this.type !== 'pie'){
        var val = (this.type==='scatter'||this.type==='heatmap')?this.wkXScaleStr:this.colNames[count];

       //�t�H���g�ƕ������ŕ����E���ē��I�Ƀp�f�B���O�����͉\��??
       // var fontWidth = this.util.getValWidth(this);
       // if(fontWidth > yOffset + this.paddingBottom ){
       //   this.paddingBottom = fontWidth;
       //   //����ł͕ς��Ȃ��̂Ń`���[�g�̈�̍ăZ�b�e�B���O�p�֐��Ƃ��K�v
       // }
        this.ctx.save();
        this.ctx.textAlign = xScaleAlign;
        this.ctx.fillStyle = xScaleColor;
        this.ctx.translate(left + xWkOffset, this.chartBottom + yOffset );
        this.ctx.rotate( xScaleRotate * 2 * Math.PI / 360 );
        this.ctx.fillText(
          val,
          0 ,
          0
        );
        this.ctx.restore();
      }
      if(count===0){
        var text = (this.colNamesTitle==='')?'':'(' + this.colNamesTitle + ')';
        var x = this.chartRight + tcXOffset;
        var y = this.height - tcYOffset  ;
       // if(this.type !== 'scatter')//2016/01/20 fixed
        this.ctx.fillStyle = xScaleColor;//2014/11/25 fixed thanx @MogyFarm
        this.ctx.fillText(
           text,
           x,
           y
        );
      } else {
        this.drawMemo({
          "val": 'text',
          "left": this.chartLeft + (this.chartRight - this.chartLeft)/2,
          "top":  y + 15,
          "align": 'center',
          "color": xScaleColor,
          "font": xScaleFont
        })
      }
      if(this.type==='scatter'||this.type==='heatmap'){
        this.wkXScale = parseFloat(this.wkXScale);//change type to number
        this.wkXScale += this.xGapValue;
      }
      this.ctx.restore();
      return this;
    },
    drawYscale: function(top, count){
      if( this.useYscale==='no')return this;
      var yScaleDecimal = this.yScaleDecimal;
      var yScaleColor =
        this.op.config.yScaleColor || 
        this.gcf.yScaleColor ||
        this.textColor ||
        this.textColors.all||
        this.textColors.y ||
        "#aaa";
      var yScaleFont =
        this.op.config.yScaleFont || this.gcf.yScaleFont;
      var yScaleAlign =
        this.op.config.yScaleAlign || this.gcf.yScaleAlign || "right";
      var xOffset =
        this.util.setConfigNum(this, 'yScaleXOffset', this.op.config.yScaleXOffset, this.gcf.yScaleXOffset, this.paddingLeft - 10);
      var yOffset =
        this.util.setConfigNum(this, 'yScaleYOffset', this.op.config.yScaleYOffset, this.gcf.yScaleYOffset, 6);
      var yScaleRotate =
        this.util.setConfigNum(this, 'yScaleRotate', this.op.config.yScaleRotate, this.gcf.yScaleRotate, 0);

      xOffset = (this._addsFlg === 2)?(this.chartRight+10):xOffset;
      yScaleAlign = (this._addsFlg === 2)?'left':yScaleAlign;

      //Y�����] DESC�̓f�t�H���g�~��
      var expression = top <= this.chartTop;
      if(this.type === 'line' || this.type === 'bezi2' || this.type === 'bezi'){
        if(this.yScaleOrder === 'ASC'){
          //line����Y���ڐ������\�@yScaleOrder
          expression = top >= this.chartBottom;
        }
      }

      var val = '', percent = '';
      if(this.type === 'stacked%'){
        val =Math.round( count * 100/this.axisXLen) +'%';
      } else {
        if(expression){this.wkYScale = this.maxY}//�����C�����Ƃōčl
        val = this.util.addComma(this, this.wkYScale, yScaleDecimal);
        percent = (this.yScalePercent==='yes')?( ' ('+ Math.round(count * 100/this.axisXLen)  +'%)' ):'';
      }
      this.wkYScaleStr = val + percent;//change type to string

      this.ctx.save();
      this.ctx.save();//scatter��heatmap�łȂ���2��save���Ȃ��Ɛ����������
      if(yScaleFont)this.ctx.font = yScaleFont;
      this.ctx.fillStyle = yScaleColor;
      this.ctx.textAlign = yScaleAlign;
      this.ctx.translate(xOffset, top + yOffset );
      this.ctx.rotate( yScaleRotate * 2 * Math.PI / 360 );
      this.ctx.fillText(
        this.wkYScaleStr,
        0,
        0
      );
      this.ctx.restore();

      this.wkYScale = parseFloat(this.wkYScale);//change type to number
      this.wkYScale += this.yGapValue;

      if(count===0){
        if(this.type==='scatter'||this.type==='heatmap'){
          var text = (this.rowNamesTitle==='')?'':'(' + this.rowNamesTitle + ')';
          var x = this.chartLeft + -10;
          var y = this.chartTop + (this.chartHeight/2);
          if(yScaleFont)this.ctx.font = yScaleFont;
          this.ctx.fillStyle = yScaleColor;
          this.ctx.textAlign = yScaleAlign;
          this.ctx.textAlign = 'center';
          this.ctx.translate( 24,this.chartTop+(this.chartHeight/2) )
          this.ctx.rotate( 45 * 2 * Math.PI / 12 )
            this.ctx.fillText(
              text,
              0,
              0
            );
        }
      }
      this.ctx.restore();
       return this;
    },
    drawTitle: function(){
      if(this.title === '')return this;
      this.ctx.save();
      var title = this.title || this.gcf.title || "";
      var titleFont =
        this.op.config.titleFont || this.gcf.titleFont || "100 28px 'Arial'";
      var titleTextAlign =
        this.op.config.titleTextAlign || this.gcf.titleTextAlign || "center";
      var titleColor =
        this.op.config.titleColor || this.gcf.titleColor ||
        this.textColor ||
        this.textColors.all||
        this.textColors.title || "#ccc";
      var offsetX = this.util.setNumberOfConfigVal(this, 'titleX', this.width/2);
      //adjust titleX by the align anchor point.
      var titleX = this.util.ajustTitlesX(this, titleTextAlign, offsetX);
        //this.op.config.titleX or this.gcf.titleX or this.width/2;
      var titleY = this.util.setNumberOfConfigVal(this, 'titleY', 38);
        //this.op.config.titleY or this.gcf.titleY or 38;

      this.ctx.font = titleFont;
      this.ctx.textAlign = titleTextAlign;
      this.ctx.fillStyle = titleColor;
      this.ctx.fillText(title, titleX, titleY);
      this.ctx.restore();
      return this;
    },
    drawSubTitle: function(){
      if(this.subtitle === '')return this;
      this.ctx.save();
      var subTitle =  this.subtitle || "";
      var subTitleFont = this.op.config.subTitleFont || this.gcf.subTitleFont;
      var subTitleTextAlign = this.op.config.subTitleTextAlign || this.gcf.subTitleTextAlign || "center";
      var subTitleColor =
        this.op.config.subTitleColor || this.gcf.subTitleColor ||
        this.textColor ||
        this.textColors.all||
        this.textColors.subTitle || "#ddd";
      var offsetX = this.util.setNumberOfConfigVal(this, 'subTitleX', this.width/2);
      //adjust titleX by the align anchor point.
      var subTitleX = this.util.ajustTitlesX(this, subTitleTextAlign, offsetX);
        // this.op.config.subTitleX or this.gcf.subTitleX or this.width/2;
      var subTitleY = this.util.setNumberOfConfigVal(this, 'subTitleY', 55);
        //this.op.config.subTitleY or this.gcf.subTitleY or 55;
      if(this.title === '')subTitleY = 25;

      if(subTitleFont)this.ctx.font = subTitleFont;
      this.ctx.textAlign = subTitleTextAlign;
      this.ctx.fillStyle = subTitleColor;
      this.ctx.fillText(subTitle, subTitleX , subTitleY);
      this.ctx.restore();
      return this;
    },
    drawHanrei: function () {
      //�}��o��
      this.ctx.save();
      var len = this.hanreiNames.length;
      var xOffset =
        this.util.setConfigNum(this, 'hanreiXOffset', this.op.config.hanreiXOffset, this.gcf.hanreiXOffset, 14);
      //var yOffset =
      //  this.op.config.hanreiYOffset || this.gcf.hanreiYOffset || 40;
      var yOffset =
        this.util.setConfigNum(this, 'hanreiYOffset', this.op.config.hanreiYOffset, this.gcf.hanreiYOffset, 20);
      //add���\�b�h�p�ŏ��̖}��Ǝ��̖}��̌���
      var hanreisYSpace =
        this.util.setConfigNum(this, 'hanreisYSpace', this.op.config.hanreisYSpace, this.gcf.hanreisYSpace, 12);
      if(!this._baseY)this._baseY = 0;
      var radius =
        this.util.setConfigNum(this, 'hanreiRadius', this.op.config.hanreiRadius, this.gcf.hanreiRadius, ((len < 10)?8:(len < 20)?5:3));
      var offradius = 0;
      if(this.type==='line' ||this.type==='bezi' ||this.type==='bezi2'){
        offradius = radius/5;
        radius = radius - offradius;
      }
      var lineHeight =
        this.op.config.hanreiLineHeight || this.gcf.hanreiLineHeight || ((len < 10)?20:(len < 20)?14:8);//fixed at v1.10.3 thanx �t���ꕽ����
      var fontsize = (len < 10)?12:(len < 20)?9:6;
      var font =
        this.op.config.hanreiFont || this.gcf.hanreiFont || "100 "+fontsize+"px 'Arial'";
      let _colorSet = this.colorSet.slice(0,this.hanreiNames.length);
      var hanreiOrder = this.op.config.hanreiOrder || this.gcf.hanreiOrder || "nomal";
      if(hanreiOrder==='reverse'){
        this.hanreiNames.reverse();
        _colorSet.reverse();
      }
      var color =
        this.op.config.hanreiColor || this.gcf.hanreiColor ||
        this.textColor ||
        this.textColors.all||
        this.textColors.hanrei ||
        "#ccc";
      var align = this.op.config.hanreiAlign || this.gcf.hanreiAlign || "left";
      var shdw = (this.shadows)?this.shadows.hanrei||this.shadows.all||['#222', 5, 5, 5]:'';

      if(this._addsFlg > 0){

        if(align === "left"){
          xOffset = xOffset + 42;//�{���͉��L�̂悤�ɖڐ���̕����T�C�Y���v���ďC������
        } else {
           xOffset = xOffset;//�{����center�����l�ɉ��L�̂悤�ɖڐ���̕����T�C�Y���v���ďC������
        }
      }
      var _space = 0;
      if(this._addsFlg === 2){
        _space = this._baseY + hanreisYSpace;
      }

      for(var i = 0; i < this.hanreiNames.length; i++){
        var posy = (lineHeight * i) + yOffset + _space;
        this.ctx.beginPath();
        if(this.useShadow === 'yes')this.drawShadow(shdw[0],shdw[1],shdw[2],shdw[3]);
        this.ctx.fillStyle = _colorSet[i];
        this.ctx.strokeStyle = _colorSet[i];
        var x, y = this.chartBottom - posy;
        var fontSize = this.ctx.font.split('px')[0]||12;
        var _flen = this.hanreiNames[i];
        var fontWidth = (_flen)?((this.hanreiNames[i].length||0) * fontSize):0
        if(align === "left"){
          x = this.chartRight + xOffset;
        } if(align === "right"){
          x =  this.chartRight + this.paddingRight - xOffset;
        } if(align === "center"){
          x =  this.chartRight + ( this.paddingRight /2 - fontWidth/2)// + xOffset;

        }

        if(this.hanreiMarkerStyle === 'arc')this._markerArc(this, x, y, radius, offradius);
        else this._markerRect(this, x, y);

        this.ctx.font = font;
        this.ctx.textAlign = align || "left";
        this.ctx.fillStyle = color;
        this.ctx.fillText(
          this.hanreiNames[i],
          (align === "left")?
              (x + radius * 2 ):
              (align === "right")?
                ( x - ( radius * 2)):
                  (align === "center")?
                    ( x +( fontWidth/2)  + (radius * 2) ):
                    ( x +( fontWidth/2)  + (radius * 2) ) ,
          this.chartBottom  - posy
        );
        //add���\�b�h���̐�̖}��Y�ʒu
        if(this._addsFlg >= 1)this._baseY = posy;
        this.ctx.closePath();

      }
      this.ctx.restore();
      len=xOffset=yOffset=hanreisYSpace=radius=offradius=lineHeight=fontsize=font=color=align=shdw=_space=i=posy=x=y=fontSize=_flen=fontWidth=null;
      return this;
    },
    _markerArc:  function (that, x, y, radius, offradius){
        var x = x;
        var y = y -4 ;

        that.ctx.arc(
          x,
          y,
          radius,
          0,
          Math.PI*2
        );
        //1��ŏ����Ȃ��P�[�X�����܂ɂ���
        that.ctx.arc(
          x,
          y,
          radius,
          0,
          Math.PI*2
        );
        that.ctx.fill();

        if(that.type==='line' ||that.type==='bezi'||that.type==='bezi2'){
          that.ctx.beginPath();
          that.ctx.lineWidth=3;
          that.ctx.moveTo(x-offradius*2-6 , y  );
          that.ctx.lineTo(x+radius*2-offradius*2, y  );
          that.ctx.stroke();
        }
    },
    _markerRect: function (that, x, y, radius, offradius){
        var x = x -radius;
        var y = y - 3 -radius;
        that.ctx.fillRect(
          x,
          y,
          radius*2,
          radius*2
        );
        that.ctx.fill();
        if(that.type==='line' ||that.type==='bezi'||that.type==='bezi2'){
          that.ctx.lineWidth=3;
          that.ctx.moveTo(x-offradius*2, y+radius);
          that.ctx.lineTo(x+radius*2+offradius*2, y+radius);
          that.ctx.stroke();
        }
    },

    drawUnit: function(unit){
      if(this.type==='scatter'||this.type==='heatmap')return;
      var unitTitle = navigator.language==='ja'?'�P��:':'';
      var left =
        this.chartLeft - (this.op.config.unitXOffset || this.gcf.unitXOffset || 50);
      var top =
        this.chartTop - (this.op.config.unitYOffset || this.gcf.unitYOffset || 12);
      var color =
        this.op.config.unitColor || this.gcf.unitColor ||
        this.textColor ||
        this.textColors.all||
        this.textColors.unit ||
        "#aaa";
      var font =
        this.op.config.unitFont || this.gcf.unitFont || "100 12px 'Arial'";
      var align =
        this.op.config.unitAlign || this.gcf.unitAlign || "right";

      left = (this._addsFlg === 2)?(this.chartRight+10):left;
      align = (this._addsFlg === 2)?'left':align;

      if(typeof unit==='string'){
        this.unit = this.unit;
        this.drawMemo({
          "val": '('+unitTitle + this.unit + ')',
          "left": left,
          "top":  top,
          "align": align,
          "color": color,
          "font": font
        })
      } else if(typeof unit==='object'){
        this.unit = unit.unit;
        this.drawMemo({
          "val": '('+unitTitle + unit.unit + ')',
          "left": unit.left || left,
          "top":  unit.top || top,
          "align": unit.align || 'left',
          "color": unit.color || color,
          "font": unit.font || font
        })
      }
      return this;
    },
    _drawVals: function (op) {
      //�f�[�^�l���o�͂���
      // pie
      // stacked
      // bar
      // stackedarea
      // stacked%
      var it = op.that;
      var k = op.row;
      var l = op.col;
      if (it.useVal === 'no') return it; //no|yes
      it.ctx.save();
      it.valColor = it.op.config.valColor || it.gcf.valColor;
      var xOffset = it.valXOffset = it.op.config.valXOffset || op.xoff || it.gcf.valXOffset || 10;
      var yOffset = it.valYOffset = it.op.config.valYOffset || op.yoff || it.gcf.valYOffset || -20;
      var font = it.valFont = it.op.config.valFont || op.font || it.gcf.valFont;


      //�e�I�v�V�����͔z��Ńf�[�^�s�P�ʂł��w��ł��܂�

      if (typeof it.useVal === 'object') {
        if (it.useVal[k] === 'no') return it;
      }
      if (typeof it.valXOffset === 'object') {
        xOffset = it.valXOffset[k] || 0;
      }
      if (typeof it.valYOffset === 'object') {
        yOffset = it.valYOffset[k] || 0;
      }
      if (typeof it.valFont === 'object') {
        font = it.valFont[k] || op.font;
      }
      //�f�[�^�̕����F it.valColor�̎w�肪�Ȃ����op.color
      var color =
        (typeof it.valColor === 'string') ?
        it.valColor :
        (typeof it.valColor === 'object' &&
        it.valColor.length > 0) ?
        it.valColor[k] : op.color;
       val = op.val;
       var percent = this.util.mkPercentVal(it, val , k, l);

       val = (it.percentVal === 'yes')? percent : val;

      if (font) it.ctx.font = font;
      it.ctx.fillStyle = color;
      it.ctx.textAlign = op.align || "right";

      val = val || 0;
      op.x = op.x || 0;
      op.y = op.y || 0;

      it.ctx.fillText(
        val,
        op.x+xOffset ,
        op.y+yOffset
      );

      it.ctx.restore();
      return it;
    },
    drawMarkers: function (op) {
      //�f�[�^�}�[�J�[��`��

      if (this.type === 'stacked')return;
      if (this.type === 'pie')return;
      if (this.type === 'bezi2')return;
      if (this.type === 'bezi')return;
      if (this.type === 'ampli')return;

      var that = this;
      //var it=this.coj[this.id];
      that.ctx.save();
      if (!op) var op = that.op || {};
      var markerWidth = op.markerWidth || that.markerWidth;
      var colorSet = op.colorSet || that.colorSet;
      var wkOffset = (that.type==='scatter'||that.type==='heatmap') ? 0 : that.xGap / 2;
      var colorIndex = 0;


      if (that.type === 'stackedarea') {
        var data = that.stackedData;
      } else if (that.type === 'stacked%') {
        var data = that.stackedPData;
      } else {
        var data = that.data;
      }
     // console.log(data)
      if (that.useCss === 'yes' && that.hybridBox) {
        var cssGroup =
          document.querySelector('#-ccchart-css-group-' + that.id);
        cssGroup.innerHTML = '';
      }

      if (that.type === 'scatter') {
        for (var i = 0; i < that.dataColLen; i++) {

          colorIndex = that.hanreiNames.indexOf(that.colNames[i]);
          if (colorIndex < 0) colorIndex = 0;

          var x = ((data[0])?((data[0][i] || 0) * that.unitW):0)
                   +that.paddingLeft - that.minX * that.unitW;
          var posy =(data[0])?((data[1][i] || 0) * that.unitH):0;
          var y = (that.chartBottom - (posy  - that.minY * that.unitH));

          //draw
          _drawmarkers(x || 0, y || 0, 0, i, data, colorSet, colorIndex);
        }

      } else if (that.type === 'stacked') {
        var x = that.chartLeft + that.barPadding||((that.chartWidth/that.dataColLen)-that.barWidth)/2;
        for (var k = 0; k < that.dataColLen; k++) {
          var sumHeight = 0; //�Ϗd�˂�����
          for (var l = 0; l < that.dataRowLen; l++) {
            var y = (
              that.chartBottom
                 - ((that.data[l][k]||0) + sumHeight)
                 * that.unitH
            ) + that.barWidth/2;

            sumHeight =  that.data[l][k]
            //draw
           _drawmarkers(x, y, k, l, data, that.colorSet[k], colorIndex);
          }
          x += that.xGap;
        }

      } else if (that.type === 'bar') {

         var x = that.barPadding + that.chartLeft +that.barWidth/2;//x�����ʒu

         var _initX = x; //���� left
         var barLeft =0; //�e�o�[��left�ʒu �̏����l

         for (var k = 0; k < that.dataRowLen; k++) {//bar
            for (var l = 0; l < that.data[k].length; l++) {//col

              var _bityousei = ((that.data[k][l]>0)?that.barWidth/2:-that.barWidth/2)
              _bityousei = ((that.data[k][l]==0)?-that.markerWidth/4:_bityousei)
              var y = (
                that.chartBottom - (that.data[k][l] - that.minY) * that.unitH
              ) + _bityousei;

              //draw
              _drawmarkers(x, y, k, l, data, that.colorSet[k], colorIndex);
              x += that.xGap;
            }
            barLeft += that.barWidth + that.barGap;
            x = _initX + barLeft;
          }
      } else if (that.type === 'stacked%' ||that.type ===  'stackedarea') {

        for (var k = 0; k < that.dataRowLen; k++) {
          var x = that.chartLeft;
          x += wkOffset;
          for (var l = 0; l < data[k].length; l++) {
            colorIndex = k;
            var posy =
              data[k][l] * that.unitH;
            var y = that.chartBottom - (posy - that.minY * that.unitH);
            //draw
            _drawmarkers(x, y, k, l, data, colorSet, colorIndex);
            x += that.xGap;
          }
        }

      } else  if (that.type==='heatmap') {

          var ctx = op.ctx;//heatmap�`���p

          var _GRADIENT1={
              0.0: 'rgba(0,0,0,0.1)',
              1.0: 'rgba(0,0,0,0.0)'
          }

          var innerCircle = that.innerCircle;
          var outerCircle = that.outerCircle;

          var cdata=[]
          var _xoffset = that.paddingLeft - that.minX * that.unitW;
          var _yoffset = that.chartBottom + that.minY * that.unitH;
          for(var i=0;i<data[0].length;i++){
            var x = _xoffset + (data[0][i] || 0) * that.unitW;
            var y = _yoffset - (data[1][i] || 0) * that.unitH;
            _drawheatmap(ctx, x || 0, y || 0);
          }

          that._hm_grayGrad = ctx.getImageData(0, 0, that.width, that.height);//defoult 600*400
          var colorGrad = op.colorGrad;
          var colord=that.util.hm.coloring(that._hm_grayGrad, colorGrad);

          ctx.putImageData(colord, 0, 0);
          ctx=null;

      } else {
        for (var k = 0; k < that.dataRowLen; k++) {
          var x = that.chartLeft;
          x += wkOffset;
          for (var l = 0; l < data[k].length; l++) {
            colorIndex = k;
            var y = (
                that.chartBottom - (that.data[k][l] - that.minY) * that.unitH
              )
            if(that.type === 'line' || that.type === 'bezi2' || that.type === 'bezi'){
               if(that.yScaleOrder === 'ASC'){
                  var y = that.chartTop +  (that.data[k][l] - that.minY) * that.unitH;
               }
            }
             // console.log(y)
            //draw
            _drawmarkers(x, y, k, l, data, colorSet, colorIndex);
            x += that.xGap;
          }
        }
      }
      that.ctx.restore();


      function _drawheatmap(ctx, x, y) {

        ctx = that.util.hm.mkGrayImgData(_GRADIENT1, that, ctx, x, y, innerCircle, outerCircle);

      }

      function _drawmarkers(x, y, row, col, data, colorSet, colorIndex) {
        var curdata = data[row][col];
        if(curdata===''||curdata===undefined||isNaN(curdata)){ return }
        that.ctx.beginPath();
        that.ctx.fillStyle = colorSet[colorIndex];
        var scatterX = (that.type==='scatter'||that.type==='heatmap') ? ((data[0])?(data[0][col]):'') : '';
        var scatterY = (that.type==='scatter'||that.type==='heatmap') ? ((data[1])?(data[1][col]):'') : '';
        if (that.useCss === 'yes' &&
          (that.useMarker === 'css-ring' ||
          that.useMarker === 'css-maru')) {
          var op = {
            x: x,
            y: y,
            radius: markerWidth / 2,
            row: row,
            col: col, //scatter�ł�row�͏��0
            data: curdata,
            percent: that.util.mkPercentVal(that, curdata, row, col),
            scatterX: scatterX,
            scatterY: scatterY,
            colorSet: colorSet,
            colorIndex: colorIndex
          }
          if (that.useMarker === 'css-ring') {
            that.css_ring(op);
          } else if (that.useMarker === 'css-maru') {
            that.css_maru(op);
          }
        } else {
          that.ctx.arc( //�ۂ�ł�
          x, y, markerWidth / 2, 0, Math.PI * 2);
        }
        that.ctx.closePath();
        that.ctx.fill();
      }
      return this;
    },
    drawXLine: function () {
      //�����J�X�^���ڐ�����`��
      var op = this.xLines;
      this.ctx.save();
      for (var i = 0; i < op.length; i++) {
        var font = op[i].font || "100 18px 'Arial'";
        var value = op[i].val || 0;
        // useRow > value || 0
        if (this.type === 'line') {
          if (op[i].useRow !== undefined) {
            var useRow = op[i].useRow || ((op[i].useRow === 0) ? 0 : this.dataRowLen - 1);
            if (useRow > this.dataRowLen - 1 || useRow <= 0) useRow = 0;
            value = (this.data[useRow][this.data[0].length - 1]);
          }
        }
        value = value || 0;

        var lineColor = op[i].color || 'rgba(204,153,0,0.7)';
        var valueColor = op[i].vColor || lineColor;
        var lineWidth = op[i].width || 1;

        var fillOver = op[i].fillOver || null;
        var fillUnder = op[i].fillUnder || null;

        var xOffset = this.chartRight - (op[i].xOffset || 2);
        var yOffset = -(op[i].yOffset || 4);
        var val = this.unitH * value
            //this.chartHeight * value / this.maxY; //parseInt(this.maxY/10, 10);
        var shdw = (this.shadows) ? this.shadows.xline || this.shadows.all || ['#444', 7, 7, 5] : '';

        var keep = op[i].keep || 'no';
        var ws = this.getWsById(this.id);//���݂�WebSocket�I�u�W�F�N�g���擾
        if(ws){
          //ws�I�u�V�F�N�g��ws.op_xLines_keep�v���p�e�B�֍ō��ʂƍŏ��ʂ��L�^����
          if(keep === 'high'){
            if(ws.op_xLines_keep === undefined){
                ws.op_xLines_keep = value;
            } else {
              if(ws.op_xLines_keep < value){//�������珑��������
                ws.op_xLines_keep = value;
              }
            }
          } else if(keep === 'low') {
            if(ws.op_xLines_keep === undefined){
                ws.op_xLines_keep = value;
            } else {
              if(ws.op_xLines_keep > value){//�Ⴏ��Ώ���������
                ws.op_xLines_keep = value;
              }
            }
          } else {
             ws.op_xLines_keep = undefined;
          }

          //op_xLines_keep�ɒl�������xLine�̒lvalue��line�̈ʒuval������������
          if(ws.op_xLines_keep !== undefined){
            value  = ws.op_xLines_keep;
            val = this.unitH * value
          }
        }

        var top = (this.chartBottom - (val - this.minY * this.unitH)) || 0;

        this.ctx.beginPath();
        //line�h��Ԃ�
        if(typeof fillOver==='string'){
          this.ctx.fillStyle = fillOver;
          this.ctx.fillRect(
            this.chartLeft, //x
            this.chartTop,  //y
            this.width-this.chartLeft-this.paddingRight, //w
            top-this.paddingTop  //h
          )
        }
        if(typeof fillUnder==='string'){
          this.ctx.fillStyle = fillUnder;
          this.ctx.fillRect(
            this.chartLeft, //x
            top, //y
            this.width-this.chartLeft-this.paddingRight, //w
            this.height-top-this.paddingBottom //h
          )
        }

        //line
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = lineColor;
        if (this.useShadow === 'yes') this.drawShadow(shdw[0], shdw[1], shdw[2], shdw[3]);
        this.ctx.moveTo(this.chartLeft, top); //���C���`��J�n
        this.ctx.lineTo(this.chartRight, top); //���C���`��I��
        this.ctx.stroke();

        //value
        this.xLineStr = value;
        this.ctx.textAlign = "right";
        this.ctx.font = font;
        this.ctx.fillStyle = valueColor;
        this.ctx.fillText(
          this.xLineStr, xOffset,
          top + yOffset);
      }
      this.ctx.restore();
      return this;

    },
    _drawLine: function (op, func) {
      //�܂���n�O���t(line,ampli,area)��`��
      this.ctx.save();
      if (!op) var op = this.op || {};
      this.lineWidth = op.lineWidth || this.lineWidth;
      var lineWidthSet = this.util.setLineWidthSet(this, op);
      var colorSet = op.colorSet || this.colorSet;
      var shdw =
        (this.shadows) ? this.shadows.line || this.shadows.all || ['#222', 5, 5, 5] : '';
      for (var k = 0; k < this.dataRowLen; k++) {
        var x = this.chartLeft;
        x += this.xGap / 2; //�I�t�Z�b�g
        this.ctx.beginPath();
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = lineWidthSet[k];
        this.ctx.strokeStyle = colorSet[k];
        this.ctx.fillStyle = this.colorSet[k];
        if (this.useShadow === 'yes')
          if (lineWidthSet[k] > 1) this.drawShadow(shdw[0], shdw[1], shdw[2], shdw[3]);
          //lineWith=1�̎��e�����������Ȃ�̂�lineWidthSet[k]>1
        if (this.type === 'area') {
          this.ctx.moveTo(x, this.chartBottom);
        }
        for (var l = 0; l < this.data[k].length; l++) {
          var y = this.chartBottom - (this.data[k][l] - this.minY) * this.unitH;
          if(this.type === 'line' || this.type === 'bezi2' || this.type === 'bezi'){
            if(this.yScaleOrder === 'ASC'){
               //line����Y���ڐ������\�@yScaleOrder
               y = this.chartTop + (this.data[k][l] - this.minY) * this.unitH;
            }
          }

          if (this.type === 'area'){
            this.ctx.lineTo(x, y);
          } else {
            if (l === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
          }

          this._drawVals({
            that: this,
            //color: '#eee',
            val: (this.data[k][l] || 0),
            row: k,
            col: l,
            align: 'left',
            xoff: -25,
            yoff: 1,
            x: x,
            y: y
          });

          x += this.xGap;
        }
        if (this.type === 'area') {
          this.ctx.lineTo(x - this.xGap, this.chartBottom);
        }
        if (func) func(this);
        else this.ctx.stroke();
      }
      this.ctx.restore();
      this._ondrew(this);

      //Option ���̃C�x���g�́A�Z�L�����e�B�̃��X�N�����肤��̂ň�U��~
      //�ւ��chart.bind('load',function(e,it){})���g���Ă�������
      /* eval ���Ȃ��ꍇ */
      //if(this.op.config.onend)this.op.config.onend(this, this.op);

      /* eval ����ꍇ
      if(this.op.config.onend){
        var _;
        eval('_='+this.op.config.onend)
        _(this, this.op);
      }*/

      return this;
    },
    drawLine: function (op) {
      //�܂���O���t��`��
      this._drawLine (op, function(it){it.ctx.stroke()});
      return this;
    },
    drawAmplitude: function (op) {
      //�U���O���t��`��
      this._drawLine (op, function(it){it.ctx.fill()});
      return this;
    },
    drawArea: function (op) {
      //�ʃO���t��`��
      this._drawLine (op, function(it){it.ctx.fill()});
      return this;
    },

    _drawStackedArea: function (op, func) {
      //�ςݏグ�ʃO���t��`��
      //if(!(this.type === 'stackedarea'||this.type === 'stacked%'))return this;
      this.ctx.save();
      if(!op)var op = this.op||{};
      this.lineWidth = op.lineWidth || this.lineWidth;
      var lineWidthSet = this.util.setLineWidthSet(this, op);
      var colorSet = op.colorSet || this.colorSet;
      var shdw = (this.shadows)?this.shadows.stackedarea||this.shadows.all||['#222', 5, 5, 5]:'';
      var wkData = [];
      var wkMaxYs = [];
      for(var k = 0; k < this.dataRowLen; k++ ){
        wkData[k] = [];
        for(var l = 0; l < this.data[k].length; l++ ){
          wkData[k][l] = ((this.data[k][l]||0)+(wkData[k-1]?wkData[k-1][l]:0));
          wkMaxYs[l] = wkData[k][l];
        }
      }
      this.stackedData = wkData;
      this.stackedPData = [];
      for (var k = wkData.length - 1; k >= 0; k--) {
        var x = this.chartLeft;
        x += this.xGap / 2; //�I�t�Z�b�g
        this.ctx.beginPath();
        this.ctx.lineWidth = lineWidthSet[k];
        this.ctx.strokeStyle = colorSet[k];
        this.ctx.fillStyle = colorSet[k];
        if (this.useShadow === 'yes')
          if (lineWidthSet[k] > 1) this.drawShadow(shdw[0], shdw[1], shdw[2], shdw[3]);
          //lineWith=1�̎��e�����������Ȃ�̂�lineWidthSet[k]>1
        this.ctx.moveTo(x, this.chartBottom);

        this.stackedPData[k] = [];
        for (var l = 0; l < wkData[k].length; l++) {
          var posy = wkData[k][l] * this.unitH;
          if (this.type === 'stacked%') {
            this.stackedPData[k][l] = wkData[k][l] * 100 / wkMaxYs[l];
            posy = this.stackedPData[k][l] * this.unitH;
          }
          var y = this.chartBottom - (posy /*- this.minY * this.unitH*/ );
          this.ctx.lineTo(x, y);

          this._drawVals({
            that: this,
            //color: '#eee',
            val: (this.data[k][l] || 0),
            percent: Math.round((this.data[k][l] || 0) * 100 / wkMaxYs[l], 10),
            row: k,
            col: l,
            align: 'left',
            xoff: -10,
            yoff: -10,
            x: x,
            y: y
          });
          x += this.xGap;
        }
        this.ctx.lineTo(x - this.xGap, this.chartBottom);
        this.ctx.fill();
        // this.ctx.stroke();
      }
      this.ctx.restore();
      this._ondrew(this);
      return this;
    },
    drawStackedArea: function (op) {
      //�ςݏグ�p�[�Z���g(�\���䐄��)�O���t��`��
      this._drawStackedArea (op, function(it){});
      return this;
    },
    drawStackedPercent: function (op) {
      //�ςݏグ�p�[�Z���g(�\���䐄��)�O���t��`��
      //this.yScalePercent �� 'yes'�ł�
      this._drawStackedArea (op, function(it){});
      return this;
    },
    drawBar: function () {
      var that = this;
      var shdw = (this.shadows)?this.shadows.bar||this.shadows.all||['#222', 5, 5, 5]:'';
      that.barPadding = (that.barPadding||(((that.chartWidth/that.dataColLen)-that.barWidth)/2));

      //�S���T�C�Y���擾
      that.widthOfAllBar = getWidthOfAllBar();

      //widthOfAllBar�������ڐ���1�{�̊ԊuxGap���
      //�傫����Β���
      if(this.widthOfAllBar > this.xGap){
         this.barPadding =0;
         this.barGap =1;
         this.barWidth = this.xGap/that.dataRowLen-1
         okDrowBar();

      } else {
        //�_�O���t�`���
        okDrowBar();
      }

      this._ondrew(this);

      //�Sbar�Ƃ��̕�
      function getWidthOfAllBar (){
        //�����ڐ���1�{�̊Ԃɂ��邷�ׂẴo�[��
        //��barWith�ƌ���barGap�ƃp�f�B���ObarPadding
        //�𑫂�������widthOfAllBar�Ƃ���
        return  that.barPadding//*2
          + that.barWidth * that.dataRowLen
          + that.barGap * (that.dataRowLen-1);
      }

      //�_�O���t�`��
      function okDrowBar(){
        //�_�`��
        _drowBar(function(that,k,l,x,y,yVal){
          var tyouseiY=(that.minY<0)?0:that.minY;
          that.ctx.fillRect(
            x, y,
            that.barWidth,
           (that.data[k][l] -tyouseiY) * that.unitH
          );
        });
        //�l�`��
        _drowBar(function(that,k,l,x,y,yVal){
          if(yVal < 0){
            //�`���[�g�f�[�^�̒l���}�C�i�X�Ȃ�
            var yoff = 15
          } else {
            var yoff = -15
          }
          that._drawVals({
            that: that,
             // color: '#eee',
            val:that.data[k][l] ,
            row:k,
            col:l,
            align: 'left',
            xoff: 2,
            yoff: yoff,
            x: x  ,
            y: y
          });
        });

        function _drowBar(func){
          that.ctx.save();
          for (var k = 0; k < that.dataRowLen; k++) {
            var x = that.chartLeft +that.barPadding;
            that.ctx.beginPath();
            that.ctx.fillStyle = that.colorSet[k];
            if(that.useShadow === 'yes')that.drawShadow(shdw[0],shdw[1],shdw[2],shdw[3]);
            for (var l = 0; l < that.data[k].length; l++) {
              var tyouseiY=(that.minY<0)?that.minY:that.minY;
              var y = that.chartBottom - (that.data[k][l]-tyouseiY)* that.unitH;
              var yVal = that.data[k][l];
              func(that,k,l,x,y,yVal);
              x += that.xGap;
            }
            that.ctx.translate(that.barWidth + that.barGap, 0);
          }
          that.ctx.restore();
          return this;
        }
      }
    },
    drawStackedBar: function () {
      //�Ϗd�˃O���t��`��
      this.ctx.save();
      var that = this;
      var useSumLine = 'yes';
      var x = that.chartLeft +(that.barPadding||(((that.chartWidth/that.dataColLen)-that.barWidth)/2));
      var shdw =
        (this.shadows)?this.shadows.stacked||this.shadows.all||['#222', 5, -5, 5]:'';
      var zeroBase = (this.minY<0)? this.minY * this.unitH:0;

      //Cols
      for (var k = 0; k < that.dataColLen; k++) {
        var currntY = 0; //�Ϗd�˂����ݒn
        var currntYUp = 0; //�Ϗd�˂����ݒn
        var currntYDown = 0; //�Ϗd�˂����ݒn

        //Rows
        for (var l = 0; l < that.dataRowLen; l++) {
          var direction = (that.data[l][k]>=0)?1:-1;//1===up -1===down �u���b�N�̌��� �l��-�Ȃ牺����
          var blockHeight = (that.data[l][k]||0) * that.unitH;//�e�u���b�N�̍���

          that.ctx.beginPath();
          that.ctx.fillStyle = that.colorSet[l];
          if(that.useShadow === 'yes')that.drawShadow(shdw[0],shdw[1],shdw[2],shdw[3]);
          that.ctx.fillRect(
            x,
            that.chartBottom+zeroBase-blockHeight,
            that.barWidth,
            blockHeight
          );
          //�l
          that._drawVals({
            that: that,
            color: '#eee',
            val:(that.data[l][k]||0) ,
            row:k,
            col:l,
            align: 'left',
            xoff:2,
            yoff:-20,
            x: x  ,
            y: that.chartBottom +zeroBase+ 15
                    -((direction<0)?blockHeight:0)//�u���b�N�̌��������Ȃ�ʒu����
          });

          //�u���b�N���݌v
          currntY+=blockHeight;
          if(direction===1){
            currntYUp+=blockHeight;
          } else�@{
            currntYDown+=blockHeight
          }

          //���̃u���b�N�̕����ɂ��translate��Y�l�����߂�
          var nextDirection =direction;//�f�t�H���gdirection
          //�u���b�N�̃I�t�Z�b�gY
          var transOffsetY;
          //���̃u���b�N�����݂���Ȃ�����𒲂ׂăZ�b�g����
          if(that.data[l+1]){
            //���̃u���b�N�̕���  1===up -1===down
            nextDirection = (that.data[l+1][k]>=0)?1:-1;
            if(direction === nextDirection){
              //�����������Ȃ�u���b�N��������
              that.ctx.translate(0,   -blockHeight );
            } else {
              //�u���b�N�̕������Ⴆ�΃u���b�N���̍��v������(�܂�t������)
              if(direction===1){
                that.ctx.translate(0,  currntYUp+currntYDown-blockHeight);
              } else {
                that.ctx.translate(0,  -currntYUp+currntYDown-blockHeight);
              }
            }

          } else {
            //���̃u���b�N�����݂��Ȃ��Ȃ炻�̗�͍Ō�Ȃ̂ŗ񖈂�translate�͖��� �s���̃��Z�b�g
            if(direction===1){
              that.ctx.translate(0,  currntYUp-blockHeight);
            } else {
              that.ctx.translate(0,  currntYDown-blockHeight);
            }
          }
        }
        x += that.xGap;
      }
      that.ctx.restore();
      this._ondrew(this);
      return this;
    },
    drawCandle: function(){
      var that = this;
      var open;
      var hight;
      var low;
      var close;
      var barTop
      var upDown;

      var candleLineWidth = this.op.config.candleLineWidth || this.gcf.candleLineWidth || 1;
      var candleBoxWidth = this.op.config.candleBoxWidth || this.gcf.candleBoxWidth || 10;
      //candleBoxWidth�������ڐ���1�{�̊ԊuxGap���
      //�傫����Β���
      if(candleBoxWidth > this.xGap){
        candleBoxWidth =this.xGap -1
      }

      var candleColorLine = this.op.config.candleColorLine || this.gcf.candleColorLine || '#888';
      var candleColorUp = this.op.config.candleColorUp || this.gcf.candleColorUp || 'deeppink';
      var candleColorDown = this.op.config.candleColorDown || this.gcf.candleColorDown || '#888';

      var x_line = that.chartLeft + (this.xGap/2);//line��x�ʒu
      var x_bar = that.chartLeft + (this.xGap/2) - (candleBoxWidth/2);//bar��x�ʒu

      this.ctx.save();

      for (var k = 0; k <= that.dataColLen; k++) {//date
          var _data = that.data;
          open  = parseInt(_data[0][k],10);
          hight = parseInt(_data[1][k],10);
          low   = parseInt(_data[2][k],10);
          close = parseInt(_data[3][k],10);

          upDown = close - open;
          if (upDown>0){
            color = candleColorUp;//�㏸�F
            barTop = close;
          } else if (upDown===0){
            upDown = 1;//
            color = candleColorLine;
            barTop = close;
          } else {
            color = candleColorDown;//���~�F
            barTop = open;
          }

          //draw line
          var y_line_hight = that.chartBottom - (hight - that.minY) * that.unitH;
          var y_line_low = that.chartBottom - (low - that.minY) * that.unitH;

          this.ctx.beginPath();
          this.ctx.lineWidth  = candleLineWidth;
          this.ctx.strokeStyle = candleColorLine;
          this.ctx.moveTo(x_line, y_line_hight);//���C���`��J�n
          this.ctx.lineTo(x_line, y_line_low);//���C���`��I��
          this.ctx.stroke();

          //draw box
          var y_bar_open = that.chartBottom - (barTop - that.minY||0) * this.unitH;
          var y_bar_close =  Math.abs(upDown) * this.unitH;

          //  console.log(k,y_bar_open,y_bar_close,upDown,'o ',open,' h ',hight,' l ',low,' c ',close)

          this.ctx.beginPath();
          this.ctx.fillStyle = color;
          this.ctx.fillRect(
            x_bar, y_bar_open,
            candleBoxWidth,
            y_bar_close
          );
          x_line += this.xGap;
          x_bar += this.xGap;
      }

      this.ctx.restore();
      this._ondrew(this);
      return this;
    },
    drawbeziLine: function () {
      this.ctx.save();
      this.lineWidth = this.lineWidth || this.lineWidth;
      var lineWidthSet = this.util.setLineWidthSet(this, this.op);
      var recx=0,recy=0;
      var shdw = (this.shadows)?this.shadows.bezi||this.shadows.all||['#222', 5, 5, 5]:'';
      for(var k = 0; k < this.dataRowLen; k++ ){
        var x = this.chartLeft;
        x += this.xGap/2; //�I�t�Z�b�g
        this.ctx.beginPath();
        this.ctx.lineWidth  = lineWidthSet[k];
        this.ctx.strokeStyle = this.colorSet[k];
        if(this.useShadow === 'yes')this.drawShadow(shdw[0],shdw[1],shdw[2],shdw[3]);
        for(var l = 0; l < this.data[k].length; l++ ){
          var y = this.chartBottom - (this.data[k][l] - this.minY) * this.unitH;
          if(l==0) this.ctx.moveTo(x,y);
          else   this.ctx.quadraticCurveTo(recx,recy,x,y);
          x += this.xGap;
          recx =x, recy =y;
        }
        this.ctx.stroke();
      }
      this.ctx.restore();
      this._ondrew(this);
      return this;
    },
    drawbeziLine2: function () {
      var shdw = (this.shadows)?this.shadows.bezi2||this.shadows.all||['#222', 5, 5, 5]:'';
      this.lineWidth = this.op.lineWidth || this.lineWidth;
      var lineWidthSet = this.util.setLineWidthSet(this, this.op);
      //�x�W�F�O���t��`��
      this.ctx.save();
      for(var k = 0; k < this.dataRowLen; k++ ){
        var x = this.chartLeft;
        x += this.xGap/2; //�I�t�Z�b�g
        this.ctx.beginPath();
        this.ctx.lineWidth  = lineWidthSet[k];
        this.ctx.strokeStyle = this.colorSet[k];
        if(this.useShadow === 'yes')this.drawShadow(shdw[0],shdw[1],shdw[2],shdw[3]);
        for(var l = 0; l < this.data[k].length; l++ ){
          var y = this.chartBottom - (this.data[k][l] - this.minY) * this.unitH;
          var cpx = x+(this.xGap)/2
          var cpy = this.chartBottom
             -  (((this.data[k][l+1] + this.data[k][l])/2) * this.unitH  - this.minY * this.unitH);
          if(l==0) this.ctx.moveTo(x,y);
          else if(l==this.data[k].length-1)this.ctx.quadraticCurveTo(x,y,x,y);
          else   this.ctx.quadraticCurveTo(x,y,cpx,cpy);

          x += this.xGap;
        }
        this.ctx.stroke();
      }
      this.ctx.restore();
      this._ondrew(this);
      return this;
    },
    drawScatter: function () {
      //var shdw = (this.shadows)?this.shadows.scatter||this.shadows.all||['#222', 5, 5, 5]:'';
      //Todo �}��񂪑��������̎���Limitter

      //�U�z�}��`��
      this.ctx.save();
      this.drawMarkers();
      this.ctx.restore();
      this._ondrew(this);
      return this;
    },
    drawHeatmap:  function () {
      //heatmap��useHanrei��"no"�AuseFirstToColName �� false

      var _GRADIENT={
        0.1 : 'blue',
        0.6 : 'cyan',
        0.7 : 'lime',
        0.8 : 'yellow',
        1.0 : 'red'
      }

      var it=this.coj[this.id];//current ccchart object

      it.hmBox = createHmDiv();//heatmap�p��div hmBox
      it.hmCanvas = createHmCanvas(); //heatmap�p��canvas hmCanvas
      var ctx = it.hmCanvas.getContext('2d');

      //�J�����gccchart canvas
      var currCanvas = it.ids[it.id];

      //hmBox��hmCanvas��}������
      it.hmBox.appendChild(it.hmCanvas);

      //�O���f�[�V����
      var _COLOR_GRADIENT = this.hm_grad || _GRADIENT;
      if(JSON.stringify(it._old_COLOR_GRADIENT)!==JSON.stringify(_COLOR_GRADIENT)){
        //�O���old_COLOR_GRADIENT�ƍ����_COLOR_GRADIENT��������ꍇ�����Čv�Z����
        it.hmColorGrad = ccchart.util.hm.mkColorImgData(_COLOR_GRADIENT, it).getImageData(0, 0, 1, 256);
        it._old_COLOR_GRADIENT=_COLOR_GRADIENT;//
      }

      //Heatmap�}��`��
      this.ctx.save();
      this.drawMarkers({
        ctx: ctx, //heatmap�`��p�p��canvas ctx
        colorGrad: it.hmColorGrad
      });
      this.ctx.restore();
      this._ondrew(this);
      return this;

      //heatmap�p��div�𐶐�����
      function createHmDiv(){
        //ccchart canvas��heatmap canvas�����b�v����div box����������
        it.hmBox = document.getElementById('-ccchart-heatmapBox-'+it.id);

        //hmBox�v�f��������΍쐬����
        if(it.hmBox=== null){
          it.hmBox= document.createElement('div');
          it.hmBox.setAttribute('class', '-ccchart-heatmapBox');
          it.hmBox.setAttribute('id', '-ccchart-heatmapBox-'+it.id);
          it.hmBox.setAttribute('style', 'position:relative;');

          var currCanvas = it.canvas;//�J�����gccchart canvas
          //currCanvas�̐e�v�f��it.hmBox��}������(currCanvas�ƌZ��)
          currCanvas.parentElement.appendChild(it.hmBox);

          it.hmBox.style.top = it.util.getStyleNum(it.id, 'top');
          it.hmBox.style.left = it.util.getStyleNum(it.id, 'left');
          //hmBox��currCanvas��}������
          it.hmBox.appendChild(currCanvas);
        }
        return it.hmBox;
      }

      //ccchart�p��canvas�Ƃ͕ʂ�heatmap�`��p��canvas�𐶐�����
      function createHmCanvas(){

        //�����̊Y��canvas������΂����Ԃ�
        it.hmCanvas = document.getElementById("-ccchart-heatmap-"+it.id)
        if(it.hmCanvas=== null){
          it.hmCanvas= document.createElement('canvas');
          it.hmCanvas.setAttribute('class', '-ccchart-heatmap');
          it.hmCanvas.setAttribute('id', '-ccchart-heatmap-'+it.id);
          it.hmCanvas.style.position = "absolute";
          it.hmCanvas.style.top = "0px";
          it.hmCanvas.style.left = "0px";
          it.hmCanvas.style.width = it.width;
          it.hmCanvas.style.height = it.height;
          it.hmCanvas.style.backgroundColor='transparent';
          it.hmCanvas.setAttribute("width",it.width+"px");//for mac safari
          it.hmCanvas.setAttribute("height", it.height+"px");//for mac safari


          var _relative = false;
          var _static = false;
          var _fixed = false;
          var _absolute = false;
          var _etc = false;
          //ccchart canvas��style �ɂ���� div��heatmap canvas style�����߂�
          for(var i in it.canvas.style){

            var name = it.util.camelCase2cssName(i);
            //�������
            if(name.indexOf('background')!==-1)continue;
            if(name.indexOf('opacity')!==-1)continue;
            if(name.indexOf('animation')!==-1)continue;
            if(name.indexOf('font')!==-1)continue;
            if(name.indexOf('fill')!==-1)continue;
            if(name.indexOf('stroke')!==-1)continue;
            if(name.indexOf('color')!==-1)continue;
            if(name.indexOf('word')!==-1)continue;
            var val=it.util.getStyle(it.id, name);
            if(val){
              //heatmap box�� ccchart canvas �̃X�^�C���������R�s�[����
              it.hmBox.style[name]=val

              //heatmap canvas �͎�� absolute top left 0 z-index��+1
              if(name==='z-index')continue;
              if(name==='position'){
                //hmBox�̏����l�� rletive -->createHmDiv
                //���̎d�����͂��܂莩�M���Ȃ�
                if(val==='relative'){
                  it.hmBox.style['position']='relative'
                  it.canvas.style['position']='absolute'
                  it.hmCanvas.style['position']='absolute'
                  _relative=true;
                  //pass
                } else if(val==='absolute'){
                  it.hmBox.style['position']='absolute'
                  it.canvas.style['position']='absolute'
                  it.hmCanvas.style['position']='absolute'
                  _absolute = true;
                } else if(val==='fixed'){
                  it.hmBox.style['position']='fixed'
                  it.canvas.style['position']='fixed'
                  it.hmCanvas.style['position']='fixed'
                  _fixed = true;
                } else if(val==='static'){
                  it.hmBox.style['position']='relative'
                  it.canvas.style['position']='static'
                  it.hmCanvas.style['position']='absolute'
                  _static = true;
                } else {
                  it.hmBox.style['position']='relative'
                  it.canvas.style['position']='absolute'
                  it.hmCanvas.style['position']='absolute'
                  _etc = true;
                }
              } else {
                it.hmCanvas.style[name]=val
              }
            }
          }
          //����
          if(_absolute || _relative || _etc){
            it.hmCanvas.style.top='0px'
            it.hmCanvas.style.left='0px'
            it.canvas.style.top='0px'
            it.canvas.style.left='0px'
            _absolute = _etc = _relative = false;

          }
          if(_static){
            it.hmCanvas.style.top='0px'
            it.hmCanvas.style.left='0px'
            _static = false;
          }
          if(_fixed){
            _fixed= false;
          }

        } else {
          //�����ς݂Ȃ�canvas�`������Z�b�g����
          it.hmCanvas.width = it.hmCanvas.width
          it.hmCanvas.height = it.hmCanvas.height
        }
        //heatmap canvas ��z-index��ccchart canvas�̏�ɂ���
        it.hmCanvas.style.zIndex = it.util.getStyleNum(it.id, 'z-index')+1;



        return it.hmCanvas;
      }
    },
    drawPie: function(){
      this.ctx.save();
      var that = this;
      var shdw = (this.shadows)?this.shadows.pie||this.shadows.all||['#444', 3, 3, 3]:'';
      //var pieMaxCol = this.op.config.pieMaxCol || this.gcf.pieMaxCol || 0;
      var pieDataIndex =
        (this.op.config.pieDataIndex != undefined)?
        this.op.config.pieDataIndex: (this.gcf.pieDataIndex?this.gcf.pieDataIndex:(this.dataColLen-1));
      if(pieDataIndex < 0 || pieDataIndex > (this.dataColLen-1))pieDataIndex = (this.dataColLen-1);
      var colNameFont =
        this.op.config.colNameFont ||this.op.font || this.gcf.colNameFont || "100 18px 'Arial'";
      var cnfs = this.util.getFontSizeFromStyle(colNameFont);
      var valFont = this.valFont =
        this.op.config.valFont || this.op.font || this.gcf.valFont || "100 12px 'Arial'";
      var stfs = this.util.getFontSizeFromStyle(
        (this.op.config.subTitleFont || this.gcf.subTitleFont || "100 12px 'Arial'")
      );
      var xOffset = this.op.config.pieXOffset || this.gcf.pieXOffset || 0;
      var yOffset = this.op.config.pieYOffset || this.gcf.pieYOffset || 0;
      var pieValPosOffset = this.op.config.pieValPosOffset || this.gcf.pieValPosOffset || 8;

      //pieHoleRadius��pieRingWidth���w�肵�Ă��������������̂�
      //�M�p�ł��Ȃ��Ƃ��낪�g���ɂ���

      var hfW = this.chartWidth/2; //�`���[�g�G���A�� 1/2
      var hfH = (this.chartHeight - stfs)/2; //�`���[�g�G���A���� 1/2
      var ringWmin = 20;//�����O���̍ŏ��T�C�Y
      var holeRmin = 50;//�h�[�i�c���̔��a�ŏ��T�C�Y

      var holeR = this.pieHoleRadius; //�h�[�i�c���̔��a
      if((holeR >= hfW) || (holeR >= hfH))ringW=ringWmin;
      //�h�[�i�c�����`���[�g�G���A���𒴂�����
      holeR = Math.min(
        ((holeR >= hfW)?(hfW - ringWmin):holeR),
        ((holeR >= hfH)?(hfH - ringWmin):holeR)
      );
      //�h�[�i�c��+�����O��/2���@hfW�܂���hfH�𒴂�����
      var ringW = this.pieRingWidth; //�����O��
      var radius = getRadius(holeR, ringW);
      ringW = Math.min(
        ((radius >= hfW)?(hfW - holeR):ringW),
        ((radius >= hfH)?(hfH - holeR):ringW)
      );
      radius = getRadius(holeR, ringW);
      var center = Math.min(this.chartHeight ,this.chartWidth )
      var y = this.chartTop+this.chartHeight/2 + yOffset;
      var x = this.width/2 + xOffset;
      var colAry = [];
      var degAry = [];
      var perAry = [];
      var newDeg = 0, oldDeg = 0;
      var TORAD = 2*Math.PI/360;//deg to radian
      var pieDataLastIndex = pieDataIndex;//this.dataColLen

      this.drawXscale(this.chartLeft, 0);

      for(var k = pieDataIndex; k <= pieDataLastIndex; k++){
        colAry[k]=degAry[k]=[];deg = 0;
        for(var preCol = 0; preCol < this.dataRowLen; preCol++ ){
          colAry[k].push(this.data[preCol][k]||0);//��z��쐬
        }
        degAry[k] = this.util.aryToDeg(colAry[k]);//�p�x�z��쐬
        perAry[k] = this.util.aryToPercent(colAry[k]);//�p�x�z��쐬
        for(var l = 0; l < degAry[k].length; l++ ){
          newDeg += degAry[k][l];
          var val = colAry[k][l];
          _drawArc(
            x, y, radius,
            oldDeg * TORAD, newDeg * TORAD,
            this.colorSet[l], k, l,
            val
          );
          oldDeg = newDeg;
        }
      }

      this.ctx.restore();
      this._ondrew(this);

      //���a�擾
      function getRadius(holeRadius, ringW){
        return holeRadius + ringW/2;
      }
      //�h�[�i�c���̒��a
      function getHoleW(radius, ringW){
        return radius*2 - ringW;
      }

      function _drawArc(x, y, r, rStartAng, rEndAng, color,k,l,val){
        that.ctx.save();
        that.ctx.beginPath();
        that.ctx.strokeStyle =  that.colorSet[l];
        that.ctx.lineWidth =  ringW;
       // that.drawShadow(shdw[0],shdw[1],shdw[2],shdw[3]);

        //�l��XY
        var rad = rStartAng + (rEndAng - rStartAng)/2;
        var valX = x+(radius+ringW/2+pieValPosOffset) * Math.cos( rad )
        var valY = y+(radius+ringW/2+pieValPosOffset) * Math.sin( rad )
        var val = parseInt(val);
        if(that.wsuids.length === 0){
          val = (that.percentVal === 'yes')? val + ' ('+parseInt(perAry[k][l])+'%)' : val;
        }

        //�l�`��
        that._drawVals({
          that: that,
          color: that.ctx.strokeStyle ,
          val: val,
          row:k,
          col:l,
          align: (valX < x)? 'right':'left',
          //�l�̈ʒu�ɂ����aline��ς���
          font: valFont,
          xoff:1,
          yoff:5,
          x: valX,
          y: valY
        });
        try{
          //�h�[�i�b�c�`��
          that.ctx.arc(
            x,
            y,
            radius,
            rStartAng,
            rEndAng
          );
        }catch(e){ }
        //���ڃ^�C�g�������`��
        var txt = that.colNames[k]||'';
        that.ctx.textAlign = 'center';
        that.ctx.fillStyle =  that.textColor || that.textColors.all || '#333';
        that.ctx.font =colNameFont;
        //�����̍��v�����h�[�i�c�����a���傫���Ȃ牺�Ɉړ�
        if(getHoleW(radius, ringW)*2 < (txt.length * cnfs)){
          y = y + radius + ringW/2 ;
        }
        that.ctx.fillText(txt, x, y + cnfs / 2 - 2);
        that.ctx.stroke();
        that.ctx.restore();
      }
    },
    drawShadow: function (color, x, y, blur) {
      if(this.useShadow !== 'yes')return this;
       // var ua = this.util.isMobile();
       // if(ua === 'android')
       //   y = -y;
       // �e�����΂ɂ��o�O��Android4.0�Œ����Ă���炵��
      var ua = navigator.userAgent.toLowerCase();
      var isAndroid =
        /(android) ([0-9])/.exec(ua);
      if(isAndroid)y = (isAndroid[2] < 4)? -y : y;

      this.ctx.shadowColor = color||'#222';
      this.ctx.shadowOffsetX = x||5;
      this.ctx.shadowOffsetY = y||5;
      this.ctx.shadowBlur = blur||5;
      return this;
    },
    flip: function(cvs, lists, flipDirection){
      var that = this;
      var xbcss = this.util.xbcss;
      var direction = flipDirection?flipDirection:this.flipDirection;
      var scaleProp = (direction === 'x')? 'scaleX' : 'scaleY';
      var index = parseInt(this.canvas.getAttribute('data-flipIndex'), 10);
      //set a current chart to the cvs.flipListTop, and add to top of the lists
      if(isNaN(index)){
        this.flipLists = lists;
        this.flipLists.unshift(this.op);//console.log(index, next,this.flipLists)
        index = 1;
      }
      var next = this.flipLists[ index ];
      var stepMax = 5;
      var interval = 8;

      chg(cvs, next, stepMax);

      if(index >= this.flipLists.length-1){
        index = 0;
      } else index++;
      cvs.setAttribute('data-flipIndex', index);

      function chg(cvs, next, stepMax){
        var i=stepMax;
        clearInterval(this.flipID);
        this.flipID = setInterval(function(){
          try{
            var s=i/stepMax;
            if(i <= -stepMax)clearInterval(this.flipID);
            if(i >= 0){
              cvs.setAttribute('style', xbcss.enjoy(
                xbcss[scaleProp](s)
              ));
            }else if(i < 0){
              cvs.setAttribute('style', xbcss.enjoy(
                xbcss[scaleProp]( Math.abs(s) )
              ));
            }
            if(i===0){
              if(that.callback){
                that.init(cvs, next, that.callback);
              } else {
                that.init(cvs, next);
              }
            }
            i--;
          } catch(e){clearInterval(this.flipID);console.log('err')}
        },interval);
      }
      return this;
    },
    flipX: function(cvs, lists){this.flip(cvs, lists, 'x');return this;},
    flipY: function(cvs, lists){this.flip(cvs, lists, 'y');return this;},
    move: function(a0,a1,a2,a3){
      if((''+a0.nodeName).toLowerCase() === 'canvas'){
        this.move1(a0,a1,a2,a3);//(cvs, config, dataAry, delay);
      } else if(this.util.isArray(a0)){
        this.move2(a0,a1);//(colData, delay)
      }
      return this;
    },
    ws: function (url, op) {
      var that = this;
      var url = url.toLowerCase().replace(/\/$/,'');
      var op = op || {};
      op = {
        //WebSocket�����Đڑ�
        autoReConnect: (op.autoReConnect===false)?false:true,
        //�Đڑ��Ԋu
        autoReConnectInterval: (op.autoReConnectInterval!==undefined)?op.autoReConnectInterval:5000,
        //�ő�Đڑ���
        maxReConnect: (op.maxReConnect!==undefined)?op.maxReConnect:5000,
        //�n�[�g�r�[�g�֘A ���ڍׂ�_hbTimerFnc���Őݒ肷��
        useHb: (!op.useHb)?op.useHb:true,
        hbStr: (op.hbStr!==undefined)?op.hbStr:"Heartbeat",
        hbInterval: (op.hbInterval!==undefined)?op.hbInterval:null,
        //�T�u�v���g�R��
        protocol: op.protocol || 'ws.ccchart.com',
        wscaseName: (op.wscaseName!==undefined)?
          op.wscaseName:
          "_wscaseFnc_"+(new Date().getTime())//�v���O�C�������������p�f�t�H���g��
      }

      var id = this.id;
      var uid = '-ccchart-ws-' + this.util.uuidv4();
      var w = this.wsuids[uid];
      //e.g. ccchart.wsuids['-ccchart-ws-d7f04e4d-c813-4337-8ccf-11a46eaa23ae']
      //e.g. ccchart.wses['-ccchart-ws-hoge0-ws://ccchart.com:8011']
      //ccchart.wses������p�~���ύX id�܂��Ս쐬����uid����T����悤�ɂ���
      //e.g. for(i in canvas.ccchart.wsuids)console.log(i,canvas.ccchart.wsuids[i])
      if (w) {
        if (w.readyState === w.OPEN && w.on) { // if OPEN
          // do nothing
        } else { // if !OPEN
          this.wsDelTarget(w);
          w = _w(true);
        }
      } else { // if !w then init
        w = _w(true);
        if (that.wsDbg || that.wsInfo)
          console.log('\n================================'
            , '\n  init a WebSocket '
            , '\n  canvas: #' + id
            , '\n  url: ' + url
            , '\n  instance: ccchart.wsuids[\'' + w.op.uid +'\']'
            , '\n  date: ' + (new Date)
          );
      }
      return w;

      function _w(first) {
        if(!that.wsuids[uid]){
          var _first4Id = true;
        }

        //WebSocket�ڑ�
        that.wsuids[uid] =
        that.wsidoj[id] =
        that.wsRecent =
          new(window.WebSocket || window.MozWebSocket)(url, op.protocol);

        if(_first4Id){
          that.wsuids[uid].opOrg = JSON.parse(JSON.stringify(that.coj[id].op)); //Original options
          _first4Id = false;
        }
        that.wsuids[uid].uid = uid;
        that.wsuids[uid].op = op;
        var openinfo = '';
        if (first) {
          op.autoReConnect = (op.autoReConnect===false)?false:true;
          if(that.wsReCnt['-ccchart-ws-'+id+'-'+url]===undefined){
            that.wsReCnt['-ccchart-ws-'+id+'-'+url] = 0;
          }
          if(!that.coj[id].wsReConnecting){
            that.wsReCnt['-ccchart-ws-'+id+'-'+url] = 0;
          }
          openinfo = 'ws opend';
        } else {

        }
        that.wsuids[uid].wsIncomingCounter = 0;//ws���M�J�E���^�[
        //ws��M�f�[�^���Ԉ����Ԋu�@��
        that.wsuids[uid].wsThinOutInterval =
          that.coj[id].op.config.wsThinOutInterval || that.coj[id].gcf.wsThinOutInterval || 0;
        that.wsuids[uid].on = function (type, fnc){//on���\�b�h
          that.wsuids[uid].addEventListener(type, fnc);
          return this;
        }
        that.wsuids[uid].op.id = id; //Chart Canvas Element ID
        that.wsuids[uid].op.uid = uid; //getTime + random
        that.wsuids[uid].op.url = url;//������/������������������url
        that.wsuids[uid].op._noReConnectClose = function () {
          var target = that.wsuids[uid];
          //�Đڑ��t���O������
          target.op.autoReConnect = false;
          if (target.readyState === target.OPEN) target.close();
        }
        that.wsuids[uid].on('open', function () {
          var target = that.wsuids[uid];
          if (!target) return;
          if (that.wsDbg || that.wsInfo)
            console.log('\n--------------------------------'
              , '\n'
              ,  openinfo + ': ' + '#' + id + ' '
              , ' ' + url
              , '\n ' + uid);
          if (op.autoReConnect)
            if(that.wsReCnt['-ccchart-ws-'+id+'-'+url]===undefined){
              if(!that.coj[id].wsReConnecting)
                that.wsReCnt['-ccchart-ws-'+id+'-'+url] = 0; //�����ڑ������Z�b�g
            }
          _hbTimerFnc(target);
        });

        that.wsuids[uid].on('close', function () {
          var target = that.wsuids[uid];
          if (!target) return;
          var info = '';
          if (that.wsDbg || that.wsInfo) {
            if(that.coj[id].wsReConnecting){
              var cnt = that.wsReCnt['-ccchart-ws-'+id+'-'+url];
              var maxcnt = op.maxReConnect;
              info = 'ws wsReConnecting closed.'
                + ' times '
                + that.wsReCnt['-ccchart-ws-'+id+'-'+url]
                + '/' + op.maxReConnect;
              console.log(info + ': '
                  + '#' + id + ' '
                  + url + ' '
                  + uid);
              if(cnt === maxcnt){
                console.log('// Reconnected retry has ended: for '
                  + '#' + id + ' '
                  + url
                  + ' check the sever');
                that.coj[id].wsReConnecting = false;
                //that.wsReCnt['-ccchart-ws-'+id+'-'+url]=0;//reset
              }
            } else {
              info = 'ws closd--'
              console.log(info + ': '
                  + '#' + id + ' '
                  + url + ' '
                  + uid);
            }
          }
          if (that.wsDbg) {
            if (target){
            console.log('\n--------------------------------'
              , '\n')
              console.log(2,id, 'autoReConnect:', op.autoReConnect);
              console.log(2,'that.coj["'+id+'"].wsReConnecting: ',that.coj[id].wsReConnecting);
              console.log(2,'wsReCnt: ', that.wsReCnt['-ccchart-ws-'+id+'-'+url],that.wsReCnt);
              console.log(2,'wscaseName:', op.wscaseName);
              console.log(2,'ws closed: #' + id
              , '\n ' + url
              , '\n ' + uid);
            }
          }
          //�����Đڑ� true �̏ꍇ�ɍċN��
          if(op.autoReConnect)setTimeout(function(){_autoReConnect(target)}, op.autoReConnectInterval);
        });

        return that.wsuids[uid];
      }

      //�����Đڑ�
      function _autoReConnect(target) {
        // onclose���ɁAop.autoReConnect��true(�f�t�H���g)�Ȃ�
        //   op.maxReConnect�̉�(�f�t�H���g8��)�A�����čĐڑ��������܂��B
        // �ڑ��񐔂�that.wsReCnt['-ccchart-ws-'+id+'-'+url]�ŃJ�E���g����܂��B
        // op.maxReConnect�𒴂����op.autoReConnect��false�ƂȂ莩���ڑ����܂���B
        // onopen ���ɉ񐔂�0�փ��Z�b�g����܂��B
        // ���Ƃ��΃R���\�[���։��L�̂悤�ȃR�[�h��ł����ނ�WebSocket��~�e�X�g���ł��܂�
        //  ccchart.wsuids['-ccchart-ws-********'].close();
        // �����ڑ��t���O����������ɂ́A
        //  ccchart.wsuids['-ccchart-ws-********'].op.autoReConnect = true;

        if (!target) return;

        //�Đڑ��t���OautoReConnect�������Ă�����WS�I�u�W�F�N�g���폜��������
        if (!op.autoReConnect) {
          that.wsDelTarget(target);
          return;
        }

        //maxReConnect�𒴂����玩���ڑ��t���O��false�֕ύX
        if (op.maxReConnect <= that.wsReCnt['-ccchart-ws-'+id+'-'+url]){
          op.autoReConnect = false;
          that.coj[id].wsReConnecting = false;
        } else {
          that.coj[id].wsReConnecting = true;
        }
        //�����ڑ��t���O��false�Ȃ�p�X����
        if (op.autoReConnect === false) return;
        //�����ڑ��񐔃J�E���g�A�b�v
        that.wsReCnt['-ccchart-ws-'+id+'-'+url]++;
        if (that.wsDbg || that.wsInfo) {
          var cnt = that.wsReCnt['-ccchart-ws-'+id+'-'+url];
          var maxcnt = op.maxReConnect;
          openinfo = 'ws retry to open.'
            + ' times '
            + cnt
            + '/' + maxcnt;
          console.log(openinfo + ': ' + '#' + id + ' ' + url);
        }

        //�ċN��
        if(target.op.wscaseName === ''){
          //�v���O�C���Ȃǂ�wscaseName��Y���ƍċN���͖����ƂȂ�܂�
          op.autoReConnect = false;
          return;
        }
      //  console.log(  'init: ' + '#' + id + ' ' + url,op.wscaseName,ccchart.wscase[op.wscaseName]);
        that.wsCloseAll();//��U�N���A

        var w =  that.init(id, that.coj[id].op, that.coj[id].ondrew)
          .ws(url, op)
          .on('open', function(){that.wsReCnt['-ccchart-ws-'+id+'-'+url] = 0;})
          .on('message', function(){
            if(document.hidden)return;
            ccchart.wscase[op.wscaseName];
            
           })

        if (that.wsDbg) console.log('\n================================'
              , '\n re inited '
              , id, ('-ccchart-ws-' + id + '-' + url)
              , '\n ws option: ' , op
              , '\n ws: ' , w)
        return w

      }

      //�n�[�g�r�[�g�^�C�}�[
      function _hbTimerFnc(target) {
        if(!op.useHb)return;
        //WebSocket�p�n�[�g�r�[�g�ݒ�
        var _MIN_HBINTERVAL = 5000;
        var _INI_HBINTERVAL = 60000;
        op.hbInterval =
          (typeof op.hbInterval === 'number') ?
            (op.hbInterval >= _MIN_HBINTERVAL) ? op.hbInterval : _INI_HBINTERVAL :
            _INI_HBINTERVAL;
        target.on('message', function (msg) {
          if(document.hidden)return;
          //�n�[�g�r�[�g�p
          try { var msgs = JSON.parse(msg.data); } catch(e) { return }
          if(msgs === target.op.hbStr){
            target.op.bncEnd = (new Date).getTime();
            //Round-Trip delay Time
            target.op.RTT = ((target.op.bncEnd - target.op.bncStart) || ' - ');
            if (that.wsDbg || that.wsInfo)
              console.log('Heartbeat returned: RTT'
                , target.op.RTT + 'ms'
                , msgs, '#'+ id
                , uid
              );
            return;
          } return;
        });
        //�n�[�g�r�[�g���Z�b�g
        clearInterval(target.op.hbTimer);
        //�n�[�g�r�[�g�J�n
        target.op.hbTimer = setInterval(function () {

          if(target.readyState !== target.OPEN){
            _autoReConnect(target)
          } else {
            target.op.bncStart = (new Date).getTime();
            target.send(target.op.hbStr);
            if (that.wsDbg)
              console.log('\n--------------------------------'
                , '\n Heartbeat send:'
                , ('#'+id, url)
                , ('\n  readyState: ' + target.readyState)
                , ('\n  hbInterval: ' + op.hbInterval)
                , ('\n  instance: ccchart.wsuids[\'' + uid +'\']')
                , ('\n  date: ' + (new Date))//���C�e���V��message���Ōv������?
              );
          }
        }, op.hbInterval);
      }
    },
    wsDelTarget: function (target) {
      //WS�I�u�W�F�N�g���폜����
      if (target.readyState === target.OPEN)target.op._noReConnectClose();
      clearInterval(target.op.hbTimer);
      //delete this.wsReCnt['-ccchart-ws-'+target.op.id+'-'+url];
      delete this.wsuids[target.op.uid];
      delete target;
      return this;
    },
    getWs: function(uid){
      if (!uid)return;
      return this.wsuids[uid];
    },
    getWsById: function(id){
      //id�ɕR�t�����ŐV��WebSocket Object��Ԃ�
      if (!id)return;
      return this.wsidoj[id];
    },
    _wsOnClose: function (target, info) {
      var that = this;
      if (!target) return;

      target.on('close', function () {
        if (that.wsDbg){
          console.log(info + ' \n id: #'+ target.op.id + ' \n url: ' + target.url);
        }
        that.wsDelTarget(target);
      });
      target.op._noReConnectClose();
      return this;
    },
    wsCloseByUid: function(uid){
      //�Y������uid�̐ڑ������
      if (!uid)return;
      if (!this.wsuids){ return; }
      var target = this.wsuids[uid];
      if (!target)return;
      this._wsOnClose(target
        , 'this closed was by the wsCloseByUid. ');
    },
    wsCloseById: function(id){
      //�Y������DOM id �̂��ׂĂ̐ڑ������
      if (!id)return;
      if (!this.wsuids){ return; }
      for (var i in this.wsuids){
        var target = this.wsuids[i];
        if (!target)continue;
        if (target.op.id === id){
          this._wsOnClose(target
            , 'this closed was by the wsCloseById. ');
        }
      }
    },
    wsCloseByUrl: function(url){
      //�Y������WebSocket url�̂��ׂĂ̐ڑ������
      if (!url)return;
      if (!this.wsuids){ return; }
      for (var i in this.wsuids){
        var target = this.wsuids[i];
        var targetUrl = target.op.url.toLowerCase().replace(/\/$/,'');
        var url = url.toLowerCase().replace(/\/$/,'');
        if (!target)continue;
        if (targetUrl === url){
          this._wsOnClose(target
            , 'this closed was by the wsCloseByUrl. ');
        }
      }
    },
    wsCloseByIdUrl: function(id, url){
      //�Y������id��url�̂��ׂĂ̐ڑ������
      if (!id)return;
      if (!url)return;
      if (!this.wsuids){ return; }
      for (var i in this.wsuids){
        var target = this.wsuids[i];
        var targetUrl = target.op.url.toLowerCase().replace(/\/$/,'');
        var url = url.toLowerCase().replace(/\/$/,'');
        if (!target)continue;
        if (targetUrl === url){
          this._wsOnClose(target
            , 'this closed was by the wsCloseByIdUrl. ');
        }
      }
    },
    wsClose: function(id, url){
      var that = this;
      if (!id)return;
      if (!url)return;
      var target = this.wsuids['-ccchart-ws-'+id+'-'+url];
    //  if (!target)return;
      console.log(id,url,this.wsuids['-ccchart-ws-'+id+'-'+url],3333333333333333)
      target.on('close',
        function (e){
          if (that.wsDbg)
            console.log('this closed was by the wsClose method: '+e.target.op.url);
          that.wsDelTarget(e.target);
        }
      );
      target.op._noReConnectClose();
      return this;
    },
    wsCloseAll: function(){
      var that = this;
      if (!this.wsuids){
        return;
      }
      for (var i in this.wsuids){
        var target = this.wsuids[i];
        if (!target)continue;
        target.on('close',
          function (e){
            if (that.wsDbg)
              console.log('this closed was by the wsCloseAll method: '+e.target.op.url);
            that.wsDelTarget(e.target);
          }
        );
        target.op._noReConnectClose();
      }
      return this;
    },
    _wsThinout: function(it, interval){
      //ws�̎�M�f�[�^���Ԉ���
      //it��_w���\�b�h����that.wsuids[uid]
      //console.log(it.wsIncomingCounter)

      //see http://ccchart.org/test/ws/IncomingCounter-1-test2.htm
      if(it.wsIncomingCounter === 0){
        //console.log(1, it.op.id,": ",it.wsIncomingCounter, interval, "�Ԉ����Ȃ�===");
        //�Ԉ����Ȃ���interval��0���Ȃ�J�E���g�A�b�v
        if(interval > 0)it.wsIncomingCounter++;
        return false;
      } else if(it.wsIncomingCounter >= interval){
        //console.log(2, it.op.id,": ",it.wsIncomingCounter, interval, "�Ԉ���");
        //�Ԉ����� ���M�J�E���^�[���Z�b�g
        it.wsIncomingCounter=0;
        return true;
      } else {
        //console.log(3, it.op.id,": ",it.wsIncomingCounter, interval, "�Ԉ���");
        //�Ԉ����ăJ�E���g�A�b�v
        it.wsIncomingCounter++;
        return true;
      }

    },
    wscase: {
      // WebSocket�̎�M�p�^�[��
      /* e.g.
      [
        ["2013", "2014", "2015", "2016", "2017"],
        [   435,  332,  524,  688,  774],
        [   600,  335,  584,  333,  457]
      ];*/

      oneColAtATime: function (msg) {
        //������this��_w���\�b�h����that.wsuids[uid]

        this.op.wscaseName = 'oneColAtATime';
        // ��x��1�񂸂� [["2013"],[435],[600]] �Ƃ������z��œ͂��ꍇ
        // e.g. ws.on('message', ccchart.wscase.oneColAtAtime)
        try { var msgs = JSON.parse(msg.data); } catch(e) { return }

        if (typeof msgs === 'string') { //if(msgs === target.hbStr){
          if (this.wsDbg)console.log('ws message type is bad, it is string : ' + msgs);
          return;
        }
        var that = ccchart.coj[this.op.id];
        var opOrg = this.opOrg;

        if(that._wsThinout(this, this.wsThinOutInterval))return;//ws��M�f�[�^���Ԉ���

        for (var i = 0; i < msgs.length; i++) {
          var _title = (opOrg.data[i])?(opOrg.data[i][0]||''):'';
          if(!that.op.data[i]){
            that.op.data[i] = [];//��M�f�[�^��length���������瑝�₷
            that.rowNames[i] = (opOrg.data[i])?(opOrg.data[i][0]||''):''
          }
          that.op.data[i].shift(); // �擪���s�^�C�g���Ƃ��č폜
          that.op.data[i].push(msgs[i]); // WS�Ŏ󂯎�����f�[�^��ǋL
          if (that.op.data[i].length > that.maxWsColLen) {
            that.op.data[i].shift(); // maxWsColLen��ȏ�͍폜
          }
          that.op.data[i].unshift(_title); // �擪�֍s�^�C�g����߂�
        }

        //�����f�[�^length����M�f�[�^length�����Ȃ����A�S�[�X�g���c��Ȃ��悤�ɏ��� fix 2015/6/16
        for (var i = 0; i < that.op.data.length; i++) {
          if(msgs[i] === undefined){
            that.op.data.splice(i,1);
          }
        }
        if (that.type === 'pie') {
          that.op.config.maxWsColLen = 1
        }
        that.coj[that.id]['s'] = (new Date).getTime(); //�`��J�n����

        //�ċN��
        ccchart.init(that.id, that.op, function () {
          that.coj[that.id].e = (new Date).getTime(); //�`��I������
        });
      },
      someColsAtATime: function (msg) {
        // ��x�ɕ����񂸂� [[["���iA"],[435],[600]],[["���iB"],[332],[335]],[["���iC"],[524],[584]]]
        // �Ƃ������z��œ͂��ꍇ  ������̗� === maxWsColLen
        // e.g. ws.on('message', ccchart.wscase.someColsAtATime)
        this.op.wscaseName = 'someColsAtATime';

        try { var msgs = JSON.parse(msg.data); } catch(e) { return }

        var that = ccchart.coj[this.op.id];
        if (that.drawing) {
          console.log('I threw away the data: ', JSON.stringify(msgs));
          return; // �O���t�`�撆�Ȃ璅�M�f�[�^���̂Ă�
        }
        for (var j = 0; j < msgs.length; j++) {
          for (var i = 0; i < msgs[j].length; i++) {
            var rowTitle = that.op.data[i].shift(); // �擪���s�^�C�g���Ƃ��č폜
            that.op.data[i].push(msgs[j][i]); // WS�Ŏ󂯎�����f�[�^��ǋL
            if (that.op.data[i].length > that.maxWsColLen) {
              that.op.data[i].shift(); // maxWsColLen��ȏ�͍폜
            }
            that.op.data[i].unshift(rowTitle); // �擪�֍s�^�C�g����߂�
          }
        }
        //�ċN��
        if(that.callback)ccchart.init(that.id, that.op, that.callback);
        else ccchart.init(that.id, that.op);
      },

      allColsAtATime: function (msg) {
        //�͂����f�[�^�����H�����ɂ��̂܂�ccchart�f�[�^�Ƃ��ė��p����P�[�X
        // ����ȕ��Ɏg���܂� ws.on('message', allColsAtATime)
        //  http://ccchart.org/test/someCols/test-2.htm
        //    �Ƀv���O�C���Ƃ��ē������Ă���T���v��������܂�
        this.op.wscaseName = 'allColsAtATime';

        //��M����
        try { var msgs = JSON.parse(msg.data); } catch(e) { return }

        var that = ccchart.coj[this.op.id];
        //���H�����ɂ��̂܂ܑ������B
        that.op.data = msgs;
        if (that.drawing) {
          console.log('I threw away the data: ', JSON.stringify(msgs));
          return; // �O���t�`�撆�Ȃ璅�M�f�[�^���̂Ă�
        }
        //�ċN��
        if(that.callback)ccchart.init(that.id, that.op, that.callback);
        else ccchart.init(that.id, that.op);
      },

      // wscase�p���\�b�h�Q�@����͂܂��g���Ă��Ȃ��s����
      //

      //cchart���ċN������
      reStart: function (it){
       // ccchart.init(that.id, that.op); //�ċN��
        if(it.callback)ccchart.init(it.id, it.op, it.callback);
        else ccchart.init(it.id, it.op);
      },
      parseMsg: function(it, msg){
        try { var msgs = JSON.parse(msg.data); } catch(e) { return false }

        if (typeof msgs !== 'object') {
          if (it.wsDbg)console.log('ws message type is bad: ' + msgs);
          return false;
        }

        if (it.drawing) {
          console.log('I threw away the data: ', JSON.stringify(msgs));
          return false; // �O���t�`�撆�Ȃ璅�M�f�[�^���̂Ă�
        }
        return msgs;
      },
      mkOpData: function(addAry, opData, maxWsColLen){
        //opData��addAry��maxWsColLen��ȓ��ŒǋL���ĕԂ�
        for (var i = 0; i < addAry.length; i++) {
          if(!opData[i])continue;
          var rowTitle = opData[i].shift(); // �擪���s�^�C�g���Ƃ��č폜
          opData[i].push(addAry[i]); // WS�Ŏ󂯎�����f�[�^��ǋL
          if (opData[i].length > maxWsColLen) {
            opData[i].shift(); // maxWsColLen��ȏ�͍폜
          }
          opData[i].unshift(rowTitle); // �擪�֍s�^�C�g����߂�
        }
        return opData;
      }
    },
    //�������F
    move1: function(cvs, config, dataAry, delay){
      console.log('������');return;

      var that = this;
      var dly = (delay!==undefined)?delay:100;
      var cnfIsAry = this.util.isArray(config);
      var i = 0;
      clearInterval(this.moveTid);
      this.moveTid = setInterval(function () {
        try{
          if(i < dataAry.length - 1) {
            i++;
              var chartdata = {
              "config": (cnfIsAry)?config[i]:config,
              "data": dataAry[i]
            }
            that.init(cvs, chartdata);
          } else {
            clearInterval(this.moveTid);
          }
        } catch(e) {
          clearInterval(this.moveTid);
        }
      }, dly);
      return this;
    },
    //�������F
    move2: function(colDataAry, delay){
      console.log('������');return;

      var that = this;
      if(!colDataAry)return this;
      if(this.moveStack.length===0){
        if(!this.moveIntOpData){
          this.moveIntOpData = JSON.stringify(this.op.data);
          if(this.useFirstToRowName){
            this.moveIntRowNames = this.rowNames;
          }
        } else if(this.moveIntOpData!==this.op.data){
          this.moveDly = 0;//move2 delay �����l
          this.moveStack = [];
          this.moveStackDly =[];
          this.op.data = JSON.parse(this.moveIntOpData);
        }
      }
      var dly = delay || 200;
      this.moveDly += dly;
      var cnf = this.op.config;
      var d = this.op.data;
      for(var i=0; i<d.length;i++){
        d[i].shift();
        d[i].shift();
        d[i].push(colDataAry[i]);
        d[i].unshift(this.moveIntRowNames[i-1]);
        if(i===d.length-1){
          this.moveStack.push(JSON.stringify(d));
        }
      }
      this.moveStackDly.push(this.moveDly);
      if(this.moveStack.length===0){
        draw(that);
      } else {
        var tid = setTimeout(function(){
          clearTimeout(tid);
          draw(that);
        },  this.moveStackDly.shift());
      }
      function draw(that){
        var data =JSON.parse(that.moveStack.shift());
        that.init({
          "config": cnf,
          "data": data
        });
      }
      return this;
    },
    drawImg: function(arg){
      //e.g.
      // "img": ["hoge.png", 80,120] // a image
      // "img": [["hoge.png", 60,180,250,80], ["hoge.png", 60,180,250,80]] //some images
      if(!arg)var arg = this._img||[];
      if(!this.util.isArray(arg))return;
      if(typeof arg[0] === 'string'){
        this.drawImgs(arg);
      } else if(this.util.isArray(arg[0])) {
        for (var i = 0; i< arg.length; i++){
          this.drawImgs(arg[i]);
        }
      }
    },
    drawImgs: function(arg){
      //e.g.
      // "img": ["hoge.png"]
      // "img": ["hoge.png", 80,120]
      // "img": ["hoge.png", 60,180,250,80]
      // "img": ["hoge.png", 50, 50, 100, 50, 10, 10, 200, 50]
      if(!arg)var arg = this._img||[];
      var url =  arg[0] || "";
      if(url === "")return this;
      var len = arg.length;
      var that = this;
      var sx,sy,sw,sh,dx,dy,dw,dh;
      var img = new Image();
      img.canvasId = this.id;
      img.src = url;
      img.onload = function(e){
        that.currImgTargetCtx = that.cxs[this.canvasId];
        that.currImgTargetCtx.save();
        that.currImgTargetCtx.globalAlpha = that.coj[this.canvasId].imgAlpha;
        if(len ===1){
          dx = 0;
          dy = 0;
          dw = that.width;
          dh = that.height;
          that.currImgTargetCtx
            .drawImage(img, dx, dy, dw, dh);
        } else if(len <=3){
          dx = arg[1] || 0;
          dy = arg[2] || 0;
          that.currImgTargetCtx
            .drawImage(img, dx, dy);
        } else if(len <=5){
          dx = arg[1] || 0;
          dy = arg[2] || 0;
          dw = arg[3] || 0;
          dh = arg[4] || 0;
          that.currImgTargetCtx
            .drawImage(img, dx, dy, dw, dh);
        } else if(len <=9 ){
          sx = arg[1] || 0;
          sy = arg[2] || 0;
          sw = arg[3] || 0;
          sh = arg[4] || 0;
          dx = arg[5] || 0;
          dy = arg[6] || 0;
          dw = arg[7] || 0;
          dh = arg[8] || 0;
          that.currImgTargetCtx
            .drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        }
        that.currImgTargetCtx.restore();
      }
    },
    drawMemo: function(op){
      this.ctx.save();
      if(!op)var op = this._memo||{};
      var val =  op.val || "";
      var left = op.left || 0;
      var top = op.top || 0;
      var lineTo = op.lineTo || false;
      var lineTo2 = op.lineTo2 || false;
      if(!(val && ((left && top) || lineTo || lineTo2)))return this;
      var font = op.font || "100 14px 'Arial'";
      var textAlign = op.align || "left";
      var fillStyle = op.color || this.textColor ||this.textColors.all|| this.textColors.memo || "#ccc";
      var opacity =  op.opacity || this.textOpacity || 1;
      if(this.util.isArray(lineTo)){
        if(lineTo.length===2){
          var lineToXOffset  = (typeof op.lineToXOffset ==='number')?op.lineToXOffset:50;
          var lineToYOffset  = (typeof op.lineToYOffset ==='number')?op.lineToYOffset:3;
          var lineToWidth  = (typeof op.lineToWidth ==='number')?op.lineToWidth:1;
          var lineToColor  = op.lineToColor || fillStyle;

        } else {
          lineTo = false;
        }
      } else lineTo = false;

      this.ctx.font = font;
      this.ctx.textAlign = textAlign;
      this.ctx.globalAlpha  = opacity;
      this.ctx.fillStyle = fillStyle;
      this.ctx.fillText(val, left, top);

      if(lineTo){
        var that = this;
        _lineTo(
          decodeURIComponent(_getNum(this.id, 'rowNames', lineTo[0])),
          decodeURIComponent(_getNum(this.id, 'colNames', lineTo[1]))
        )
      }
      this.ctx.restore();
      return this;

      function _lineTo(row, col){
        //line
        var x = that.chartLeft + that.xGap / 2 + that.xGap * col;
        var y = that.chartBottom - ( that.data[row][col] - that.minY ) * that.unitH;
        that.ctx.save();
        that.ctx.beginPath();
        that.ctx.lineWidth = lineToWidth;
        that.ctx.strokeStyle = lineToColor;
        that.ctx.moveTo(left + lineToXOffset, top + lineToYOffset);
        that.ctx.lineTo(x, y);
        that.ctx.stroke();
        that.ctx.restore();
      }
      function _getNum(id, prop, val){
        for(var i=0;i<that.coj[id][prop].length;i++){
          if(''+that.coj[id][prop][i]===''+val)return i;
        }
        //console.log('This '+prop+' does not exist.')
      }
    },
    drowText: function(string, left, top, color, fontSize, interval){
      var that = this;
      var id = this.id;
      var fnc = this.drowText;
      fnc.startLeft = fontSize

      if(fnc.resetPos){
        fnc.left = undefined;
        fnc.top = undefined;
        fnc.resetPos = false;
      }
      if(!fnc.left)fnc.left = fnc.startLeft;
      fnc.left += left;
      if(!fnc.top)fnc.top = fnc.startTop;
      fnc.top += top;
      if(!fnc.interval)fnc.interval = 0;
      fnc.interval += interval;
      var op = {
        val: string,
        left: fnc.left,
        top:  fnc.top,
        color: color,
        font: "100 "+ fontSize +"px 'Arial'"
      }
      setTimeout(function(){that.coj[id].memo(op)}, fnc.interval);
      return this;
    },
    setDrowText: function(startLeft, startTop, resetPos, resetInterval){
      if(resetPos)this.drowText.resetPos = true;
      else     this.drowText.resetPos = false;
      if(resetInterval)this.drowText.interval = 0;
      this.drowText.startLeft = startLeft || 0;
      this.drowText.startTop = startTop || 0;
      return this;
    },
    thanx: function(){
      //�ŏ��̕����� left �� top ���w�肷��
      this.setDrowText(120, 180)
        //�E��0, ����0�ړ����� orange�Ńt�H���g�T�C�Y120�s�N�Z����100ms�b��ɏ����B�ȉ����l
        .drowText('T', 0, 0, 'orange', 120, 100)
        .drowText('h', 70, 0, 'orange', 120, 100)
        .drowText('a', 60, 0, 'orange', 120, 100)
        .drowText('n', 60, 0, 'orange', 120, 100)
        .drowText('k', 60, 0, 'orange', 120, 100)
        .drowText(' ', 50, 0, 'orange', 120, 100)
        .drowText('y', 40, 0, 'orange', 120, 100)
        .drowText('o', 50, 0, 'orange', 120, 100)
        .drowText('u', 60, 0, 'orange', 120, 100)
      //�ʒu�����Z�b�g����left 120, top 280��
      .setDrowText(120, 280, true)
        .drowText('F', 0, 0, 'red', 120, 100)
        .drowText('o', 60, 0, 'red', 120, 100)
        .drowText('r', 60, 0, 'red', 120, 100)
        .drowText(' ', 40, 0, 'red', 120, 100)
        .drowText('Y', 30, 0, 'red', 120, 100)
        .drowText('o', 60, 0, 'red', 120, 100)
        .drowText('u', 60, 0, 'red', 120, 100)
        .drowText('r', 60, 0, 'red', 120, 100)
      //�ʒu�����Z�b�g����left 120, top 280��
      .setDrowText(120, 380, true)
        .drowText('S', 0, 0, 'white', 120, 100)
        .drowText('u', 80, 0, 'white', 120, 100)
        .drowText('p', 60, 0, 'white', 120, 100)
        .drowText('p', 60, 0, 'white', 120, 100)
        .drowText('r', 60, 0, 'white', 120, 100)
        .drowText('t', 45, 0, 'white', 120, 100)
        .drowText('!', 60, 0, 'white', 120, 100)
      return this;
    },
    toData: function(arg){
      var type, canvas;
      if(typeof arg !== 'object'){
        type = 'image/png';
        canvas = this.canvas;
      } else {
        type = (arg.type)?arg.type:'image/png';
        if((''+arg.canvas.nodeName).toLowerCase() === 'canvas'){
          canvas = arg.canvas;
        } else {
          canvas = document.getElementById(arg.canvas);
        }
      }

      return canvas.toDataURL(type);
    },
    _add: function(front, back){
      var that = this;
      this._addsFlg = -1;
      this.addFront  = front;
      this.addBack = back;
      //�O�ʃ`���[�g�̐ݒ肪�D��ƂȂ�config�v���p�e�B
      //unit��hanrei�̏ڍׂ̓`���[�g���ɈقȂ�̂ŏ����Ă��܂�
      var lists = [
           //�^�C�g��
             "title"
            ,"titleColor"
            ,"titleFont"
            ,"titleTextAlign"
            ,"titleX"
            ,"titleY"
           //�T�u�^�C�g��
            ,"subTitle"
            ,"subtitle"//�L�������P�[�X�𐄏�
            ,"subTitleColor"
            ,"subTitleFont"
            ,"subTitleTextAlign"
            ,"subTitleX"
            ,"subTitleY"
          //�^�C�g���L��
            ,"onlyChart"
            ,"onlyChartWidthTitle"
          //�������ڐ��l
            ,"xScaleColor"
            ,"xScaleFont"
            ,"xScaleAlign"
            ,"xScaleXOffset"
            ,"xScaleYOffset"
            ,"xScaleSkip"
            ,"colNamesTitleOffset"
            ,"colNameXTitleOffset"
            ,"colNameYTitleOffset"
          //�������ڐ��l
            ,"yScaleColor"
            ,"yScaleFont"
            ,"yScaleAlign"
            ,"yScaleXOffset"
            ,"yScaleYOffset"
          //�����E��
            ,"height"
            ,"width"
          //�}��
            ,"useHanrei"
          //�p�f�B���O
            ,"paddingTop"
            ,"paddingRight"
            ,"paddingLeft"
            ,"paddingBottom"
          //�ڐ�����̖{��
            ,"axisXLen"
            ,"axisYLen"
          //�ڐ�����̕�
            ,"axisXWidth"
            ,"axisYWidth"
            ,"axisYSkipWidth"
          //�ڐ�����̐F
            ,"xColor"
            ,"yColor"
          //�w�i�F
            ,"bg"
          //�w�i�O���f�[�V����
            ,"bgGradient"
          //�e�L�X�g�J���[�I�u�W�F�N�g
            ,"textColors"
          //�e�I�u�W�F�N�g
            ,"shadows"
      ];
      //_ondrew��add�p�ɏ㏑��
      this._ondrew = function (that){

        //�`���[�g�̈�̐��`�ɉe����^����v���p�e�B�� front���ɂ��낦��
        _setSizes(back.op.config, front.op.config, lists);
        //1���� back ���ɕ`��
        that._addsFlg = 1;
        that.init(back.id, back.op, function(){

          _setSizes(front.op.config, back.op.config, lists);
          //2���� front ����ɕ`���d�˂�
          that._addsFlg = 2;
          that.init(front.id, front.op,function(){

            if(back.callback)back.callback();
            if(front.callback){
              front.callback();
              back = undefined;
              front= undefined;
            }

            that._addsFlg = undefined;
            //_ondrew�����Z�b�g
            that._ondrew = that._ondrew_old;
          });

        });
        function _setSizes(cpTo, cpFrom, lists){
          for(var i=0; i < lists.length; i++){
            cpTo[lists[i]] = cpFrom[lists[i]];
          }
        }
      }
      //���̎��_��_ondrew���I����Ă�����N������
      if(!that.drawing)that._ondrew(this);

      return this;
    },
    add: function(op, callback){
      var initArgs = this.util.deepJSONCopy({id: this.id, op: this.coj[this.id].op, callback: this.coj[this.id].callback});//init��
      var addArgs = this.util.deepJSONCopy({id: this.id, op: op, callback: callback});//add��after��
      addArgs.op.config.title =  initArgs.op.config.title;
      addArgs.op.config.subTitle =  initArgs.op.config.subTitle || initArgs.op.config.subtitle;
      this._add(initArgs, addArgs);//init��O�ɕ`��
      return this;
    },
    after: function(op, callback){
      this.add(op, callback);
    },
    before: function(op, callback){
      var initArgs = this.util.deepJSONCopy({id: this.id, op:this.coj[this.id].op, callback:this.coj[this.id].callback});//init��
      var beforeArgs = this.util.deepJSONCopy({id: this.id, op:op, callback:callback});//before��
      initArgs.op.config.title =  beforeArgs.op.config.title;
      initArgs.op.config.subTitle =  beforeArgs.op.config.subTitle || beforeArgs.op.config.subtitle;
      this._add(beforeArgs, initArgs);//before��O�ɕ`��
      return this;
    },
    line: function(op){ this.drawLine(op);return this; },
    markers: function(op){ this.drawMarkers(op);return this; },
    memo: function(op){ this.drawMemo(op);return this; },
    setOp: function(prop, ops){//test for ops
      //this.setOp('width', op.config.width || 600);
      return this.coj[this.id][prop] = this[prop] = ops;
    },
    moduleExtend: function (oj, prop, name, update) {
      if(!oj)return;
      //�������݂̂Ȃ�function (oj=this, prop=oj)
      if (!prop) {
        prop = oj;
        oj = this;
      }
      if (!prop['aboutThis_module'])
        prop['aboutThis_module'] = {
          name: name
      };
      for (var i in prop) {
        if (i === 'aboutThis_module') {
          //aboutThis_module��ccchart.aboutThis.plugins�ȉ���
          oj['aboutThis']['plugins'][prop[i].name] = prop[i];
        } if (i === 'init') {
          //init�̓R�s�[���Ȃ�
        } else {
          if(!oj[i] || update){
            //i��ccchart���ɑ��݂��Ȃ����Aupdate��true�Ȃ�R�s�[����
            oj[i] = prop[i];
          } else {
            for(var j in prop[i]){
              if(oj[i][j]){//�������O�����łɂ���ꍇ
                if (i !== 'aboutThis_module'){
                  //console.log(this.id, 'NG: this module name is exist on ccchart property.',j)
                }
              } else {
                //console.log('OK',j)
                oj[i][j] = prop[i][j];
              }
            }
          }
        }
      }

      return oj;
    },
    loadBranch: function (op, callback) {
      //init�̑�1����op�ƈȉ��̃v���p�e�B��URL������̎��� Ajax load ����B
      var isStrOp = (typeof op === 'string');
      var isStrOpCnf = (typeof op.config === 'string');
      var isStrOpData = (typeof op.data === 'string');
      if (isStrOp) {
        this.getOption(op, callback, false);
      } else if (isStrOpData || isStrOpCnf) {
        if (isStrOpData && isStrOpCnf) {
          this.getOptionCnfData(op, callback, false);
        } else if (isStrOpCnf) {
          this.getOptionCnf(op, callback, false);
        } else if (isStrOpData) {
          this.getOptionData(op, callback, false);
        }
      } else if (this.util.isArray(op.data)) {
        this.preProcessing(op, callback);
      }
    },
    base: function base(){
      //Web�p�[�W�S�̂ɌW��`���[�g�̃O���[�o���f�t�H���g�lccchart.gcf��ݒ肷��
      var that = this;
      var len = arguments.length;
      var opCopy = '';
      if(len === 0){
        //�����Ȃ��̓f�t�H���g�e�[�}�K�p
        this.gcf = {};
        _setG(that.m.Theme['_default'] || that['_default']  || {});
      } else if(len === 1){
        //����1�̏ꍇ�́A���݂�ccchart.gcf�ɏ㏑������
        if(!this.gcf)this.gcf={};
        opCopy = this.util.cnfExtend({config:this.gcf}, _getOp(arguments[0]));
        _setG(opCopy);
      } else {
        //����2�ȏ�
        var _opNew = '';
        for(var i = 0; i < len; i++){
          var arg = arguments[i];
          //������ '' �� null�Ȃ猻�݂�ccchart.gcf���N���A�����̈�����K�p����
          if(arg==='' || arg === null){
            this.gcf = {};
            continue;
          }

          //���݂�ccchart.gcf��_opNew���㏑������
          _opNew = _getOp(arguments[i]);
          opCopy = this.util.cnfExtend({config:this.gcf}, _opNew);
          _setG(opCopy);

        }
      }
      //re drawing
      for(var i in this.ids){
        var cvs = this.ids[i];
        this.init(cvs, this.coj[cvs.id].op, this.coj[cvs.id].callback);
      }
      return this;

      function _getOp(op){
        var _op;
        var op = op? op: '_default';
        if(typeof op === 'string'){
          _op = that.m.Theme[op] || that[op] || {};
        } else if(typeof op === 'object'){
          if(!op.config)return that;
          _op = op || {};
        }
        return _op;
      }
      function _setG(op){
        //set the gloval options
        that.gcf = op.config;
        that.gdata = op.data || [[""],[""]];
        return that;
      }
    },
    toggleRC: function(id, op, callback){
      var op = op;
      op.data = this.util.changeRowsAndCols(op.data);
      this.init(this.id, op, callback)
      return this;
    },
    getOption: function(op, callback, async){
      var that = this;
      this.get(op, function(res){//op is url
        try{
          //op must be JSON
          op = JSON.parse(res);
          that.loadBranch (op, callback);
        } catch(e){ }
      }, async);
    },
    getOptionCnfData: function(op, callback, async){
      var that = this;
      this.get(op.config, function(res){//op.config is url
        try{
          //op.config must be JSON
          op.config = JSON.parse(res);
          that.getOptionData(op, callback, false);
        } catch(e){ }
      }, async);
    },
    getOptionCnf: function(op, callback, async){
      var that = this;
      this.get(op.config, function(res){//op.config is url
        try{
          //op.config must be JSON
          op.config = JSON.parse(res);
          that.preProcessing(op, callback);
        } catch(e){ }
      }, async);
    },
    getOptionData: function(op, callback, async){
      var that = this;
      this.get(op.data, function(res){//op.data is url
        try{
          //op.data must be JSON
          op.data = JSON.parse(res);
          that.preProcessing(op, callback);
        } catch(e){ }
      }, async);
    },
    util:{
         
      setConfigNum: function(it, propName, configVal, gfcVal, defaultVal){
        //�b��
        //���l�^�C�v�̃R���t�B�O�l���Z�b�g���� configVal||gfcVal �ł�0�̎��ɂ��܂����삵�Ȃ��̂�
        //defaultVal���������undefined��Ԃ�
        //e.g. setConfigNum(this, 'minY', this.op.config.minY, this.gcf.minY, 0)
        configVal=_regex(configVal);
        gfcVal=_regex(gfcVal);
        defaultVal=_regex(defaultVal);
        it[propName+'Default'] = defaultVal;
        if(typeof configVal === 'number') return it[propName] = configVal;
        if(typeof gfcVal === 'number') return it[propName] = gfcVal;
        if(typeof defaultVal === 'number')return it[propName] = defaultVal;
        return undefined;

        function _regex(val){
          //��U�����񉻂��Đ��l�ȊO�̕����񏜋���Number�����ĕԂ�
          var _val=parseFloat((''+val).replace(/[^-{0,1}[0-9]\.]/g,''));
          if(isNaN(_val))_val=undefined;//NaN��undefined�ɂ��� 
          return _val
        }
      },
      getStyle: function (id, prop){
        // e.g. ccchart.util.getStyle('hoge2', 'position')//fixed
        var el=document.getElementById(id);
        if(!el)return 0;
        return document
          .defaultView
          .getComputedStyle(el, null)
          .getPropertyValue(prop)
      },
      getStyleNum: function (id, prop){
        // e.g. ccchart.util.getStyleNum('hoge1', 'z-index')//6
        var el=document.getElementById(id);
        if(!el)return 0;
        return parseFloat(
          document
          .defaultView
          .getComputedStyle(el, null)
          .getPropertyValue(prop), 10
         )||0;
      },
      camelCase2cssName: function (name){
        //�L�������P�[�X�̖��O��CSS�̖��O�֕ϊ�����
        //e.g. font-style --> fontStyle
        return name.replace(/[A-Z]/g,
         function(s){return "-"+s.charAt(0).toLowerCase()}
        )
      },
      hm: {
        coloring: function (grayGrad, colorGrad) {
           var grayGradData = grayGrad.data;
           var colorGradData = colorGrad.data;
           var len = grayGradData.length;
           var offset;
           for (var i = 0;i < len; i += 4) {
             offset = grayGradData[i+3]*4;

             if (offset) {
                grayGradData[i] = colorGradData[offset];
                grayGradData[i + 1] = colorGradData[offset + 1];
                grayGradData[i + 2] = colorGradData[offset + 2];
              }
           }
           grayGrad.data=grayGradData
           return grayGrad
        },
        mkGrayImgData: function (grad, that, ctx, x, y, innerCircle, outerCircle) {

             var gradient =  ctx.createRadialGradient(x,y,innerCircle,x,y,outerCircle);
             for (var i in grad) {
                 gradient.addColorStop(i, grad[i]);
             }

             ctx.fillStyle = gradient;
             gradient=null;
             ctx.fillRect(x-outerCircle,y-outerCircle,2*outerCircle,2*outerCircle);
          return  ctx//.getImageData(0, 0, that.width, that.height);//defoult 600*400
        },
        mkColorImgData: function (grad, it) {

           if(!it._hmColorImgDataCanvas){
             it._hmColorImgDataCanvas = document.createElement('canvas');
             it._hmColorImgDataCanvas.width = 1;
             it._hmColorImgDataCanvas.height = 256;
           }
           var ctx = it._hmColorImgDataCanvas.getContext('2d');
           var gradient = ctx.createLinearGradient(0, 0, 0, 256);

           for (var i in grad) {
               gradient.addColorStop(i, grad[i]);
           }

           ctx.fillStyle = gradient;
           gradient=null;
           ctx.fillRect(0, 0, 1, 256);
           return  ctx//.getImageData(0, 0, 1, 256);
        }
      },

      setLineWidthSet: function (that, op){
        if(!op)op=that.op;
        var _lw = that.lineWidth;
        //�����Z�b�g lineWidthSet:[] ���w�肷��� ���ׂ�this.lineWidth�̔z��ɂȂ�
        _lineWidthSet = op.config.lineWidthSet || that.gcf.lineWidthSet || undefined;
        if(typeof _lineWidthSet === "object"){
          if(_lineWidthSet.length===0){
            //_lineWidthSet�� [] �Ȃ�
            //���ׂ�that.lineWidth ��lineWidthSet�����
            _lineWidthSet =[];
            //default length is dataRowLen
            for(var i=0; i<that.dataRowLen; i++){_lineWidthSet[i]=_lw}
            /*  e.g. it will be generate follow array.
            _lineWidthSet = [
              _lw,_lw,_lw,_lw,_lw,_lw,_lw,
              _lw,_lw,_lw,_lw,_lw,_lw,_lw,
              _lw,_lw,_lw,_lw,_lw,_lw,_lw,
              _lw,_lw,_lw,_lw,_lw,_lw,_lw
            ];*/
          } else {
            //_lineWidthSet.length>0�Ȃ̂ł����_lineWidthSet�֓K�p����
          }
        } else {
          //lineWidthSet��undefined�Ȃ�object�ȊO�Ȃ炷�ׂ�that.lineWidth ��lineWidthSet�����
          _lineWidthSet =[];
          //default length is dataRowLen
          for(var i=0; i<that.dataRowLen; i++){_lineWidthSet[i]=_lw}
        }
        return _lineWidthSet;
      },
      setNumberOfConfigVal: function(it, prop, def){//e.g. axisYSkipWidth...
        //Number�^�C�v��config�ݒ莞��( || )�����ł�0���w�肷��ƃf�t�H���g�l�ɂȂ��Ă��܂��̂�
        var num = (it.op.config[prop]!==undefined)?it.op.config[prop]:
                        (it.gcf[prop]!==undefined)?it.gcf[prop]:def;
        return it[prop] = num;
      },
      ajustTitlesX: function(it, titleTextAlign, offsetX){ //for titleX and subTitleX
        //adjust titleX by the align anchor point.
        var titlesX =
          (titleTextAlign === 'center')?(0+offsetX):
          (titleTextAlign === 'left')?(0+offsetX):
          (titleTextAlign === 'right')?(it.width-offsetX):(0+offsetX);
        return titlesX;
      },
      setPfx: function(prop){
        return ccchart.pfx[prop] = ccchart.prefix + '-' + prop;
      },
      getAxisIndex: function(axisStr, pos){
        //@see http://ccchart.org/test/axisYs-axisXs/test2.htm
        //axisStr 'axisYs'|'axisXs'
        //pos      e.offsetX|e.offsetY
        //return   [index, event position, axis position]
        var posStr = (axisStr === 'axisYs')?'left':'top';
        var data = ccchart[axisStr];
        for(var i = 0; i < data.length; i++){
          if(axisStr === 'axisYs')if(pos < data[i][posStr]){ return [i, pos, data[i][posStr]]}
          if(axisStr === 'axisXs')if(pos > data[i][posStr]){ return [i, pos, data[i][posStr]]}
        }
      },
      getValWidth: function(it, val, fontSize){
        //�l�̕���Ԃ�
        if(typeof val === 'number'){
          var len =  Math.floor(Math.log(val)/Math.log(10))+1;
           return len * fontSize;
        } else if(typeof val === 'string'){
          return val.length * fontSize;
        } return 5 * this.getCurrFontSize(it);
      },
      setDefaultCtxProps: function(it, prop, val){
        //ctx�����̃f�t�H���g�l��ݒ肷��
        it.ctx[prop] = it.cxs[it.id][prop] = val;
        return it.ctx;
      },
      getCurrFontSize: function(it){
        //ctx�����̌��݂̃t�H���g�T�C�Y��Ԃ�
        var fontSize = it.ctx.font;
        if(typeof fontSize !== 'string')return 12;
        return +fontSize.match(/(\d*)px/)[1];
      },
      changeRowsAndCols: function(data){
        //�`���[�g�f�[�^�̍s�Ɨ��ϊ������z���Ԃ�
        var newData = [];
        for(var r = 0; r < data.length; r++){
          for(var c = 0; c < data[r].length; c++){
            if(!newData[c])newData[c] = []
            newData[c].push(data[r][c]);
          }
        }
        return newData;
      },
      uuidv4: function(){
        //Thanx for
        //https://gist.github.com/jcxplorer/823878
        //http://blog.snowfinch.net/post/3254029029/uuid-v4-js
        var uuid = "", i, random;
        for (i = 0; i < 32; i++) {
          random = Math.random() * 16 | 0;
          if (i == 8 || i == 12 || i == 16 || i == 20) {
            uuid += "-"
          }
          uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid;
      },
      deepJSONCopy: function(oldObject){
        // �ЂȌ`oldObject���f�B�[�v�R�s�[
        //  (��oj�ւ̎Q�ƂȂ��R�s�[�B���łɕs����JSON���r��)
        return JSON.parse(JSON.stringify(oldObject));
      },
      cnfExtend: function(baseCnf, newCnf){
        // baseCnf�I�u�W�F�N�g���f�B�[�v�R�s�[����newCnf��ǉ�
        var base = ccchart.util.deepJSONCopy(baseCnf);
        return appendCnfCopy(base, newCnf);

        // baseCnf�I�u�W�F�N�g��newCnf��ǉ��R�s�[
        function appendCnfCopy(baseCnf, newCnf){
          for(var i in newCnf){
            var prop = newCnf[i];
            if(i === 'config' || i === 'data'){
              if(typeof prop==='object' && !ccchart.util.isArray(prop)){
                appendCnfCopy(baseCnf[i], prop);
              } else { baseCnf[i] = prop;}
            } else { baseCnf[i] = prop;}
          }
          return baseCnf;
        }
      },
      uniq: function(ary){ //[1,1,2,3,3,2] => [1,2,3]
        //�z������ڂ̏d���𖳂���
        var old=null
        var _ary=[];
        ary.sort().forEach(function(x,i,a){
          if(x===null)return;
          if(old!==x)_ary.push(x);
          old=x;
        })
        return _ary;
      },
      addComma: function (it, val, useDeci) {
        //3���J���}
        //forked from http://fukuno.jig.jp/2012/util.js#addComma
        if (isNaN(parseFloat(val))){return val;}

        var s = '';
        var decimal = '';
        var comma = '.';
        if(useDeci === 'yes'){
          s = ccchart.util.round00(val, it.roundDigit);
          decimal = s.split(comma)[1];
          s = s.split(comma)[0];
        } else {
          s += parseInt(val);
          comma = '';
        }

        var singn = s.charAt(0);
        singn = (singn==='-'||singn==='+')?singn:'';
        s = (singn==='')?s:s.substr(1);
        for (var i = 3; i < s.length; i += 4) {
          s = s.substring(0, s.length - i) + "," + s.substring(s.length - i);
        }
        decimal = isNaN(decimal)?'':comma + decimal;
        return singn + s + decimal;
      },
      round00: function(val, n) {
        //������0���ߊ֐��@�������̌�����n���ɖ����Ȃ�����0�Ŗ��߂�
        var _digit = Math.pow(10, n);
        var _val = parseFloat(val);
        var str = '' + Math.round(_val * _digit)/_digit;

        if (n <= 0) {
          //n��0�ȉ��͊ۂ߂��������̂ݕԂ� round00(33666.334, -2)��"33700"
          return str;
        }
        var zeroStr = _zero(n);
        if (str.indexOf('.') < 0){
          //�����_�����͏������t����0��t�����ĕԂ� round00(33666, 2)��"33666.00"
          return str + '.' + zeroStr;
        } else {
          //�����_�L��͏����_�t���Ō��Ŋۂ߂ĕԂ� round00(33666.335, 2)��"33666.34"
          str = str + zeroStr;
          return str.split('.')[0] + '.' +
                 str.split('.')[1].substring(0, n);
        }
        //n����0���������
        function _zero(n){
          var zeroStr = '';
          for (var i = 0; i < n; i++){
             zeroStr = zeroStr + '0';
          }
          return zeroStr;
        }
      },
      getMax: function (that){
        //�ő�l�����߂�
        return this
        ._preGetMinMax(that)
        .sort(function(a,b){return b-a})[0];
      },
      getMin: function (that){
        //�ŏ��l�����߂�
        return this
        ._preGetMinMax(that)
        .sort(function(a,b){return a-b})[0];
      },
      _preGetMinMax: function (that){
        //�S�f�[�^��A�������z���Ԃ�
        var _ary = [];
        for(var i = 0; i < that.dataRowLen; i++){
          var _aryR=[];
          for(var j = 0; j < that.data[i].length; j++){
            if(
              !(that.data[i][j]===null ||
              that.data[i][j]===undefined)
            ){
              //for candle chart
              if(that.type==='candle'){
                if(i===1 || i===2)_aryR=_aryR.concat(that.data[i][j]);//�e���hight��low�̂ݏW�߂�
              } else {
                _aryR=_aryR.concat(that.data[i][j]);
              }
            }
          }
          _ary=_ary.concat(_aryR);
        }
        return _ary;
      },
      mkPercentVal: function(it, val ,k, l){
        var sumCols = it.util.getSumCols(it);

        var percent = Math.round( val*100/sumCols[k], 10)  + '%';
        if (it.type === 'stacked'){
           percent = Math.round( val*100/sumCols[k], 10)  + '%';
        } else if (it.type === 'pie'){
          if(it.wsuids.length === 0 ){
            percent = val;
          } else {
            percent = val + ' ('+Math.round(val*100/sumCols[l])+'%)';
          }
        } else {
          percent = Math.round( val*100/sumCols[l], 10)  + '%' ;
        }
        return percent;
      },
      getSumCols: function(that){
        //�c�񍇌v�l�̔z��
        var wkData = [];
        var wkMaxYs = [];
        for(var k = 0; k < that.dataRowLen; k++ ){
          wkData[k] = [];
          for(var l = 0; l < that.data[k].length; l++ ){
            wkData[k][l] = ((that.data[k][l]||0)+(wkData[k-1]?wkData[k-1][l]:0));
            wkMaxYs[l] = wkData[k][l];
          }
        }
        return wkMaxYs;
      },
      getMaxSum: function(that){
        //�ςݏd�˂����ɍő�ɂȂ��̍��v�l�����߂�
        var _ary = [];
        var _sum = 0;
        for(var i = 0; i < that.dataColLen; i++){
          for(var j = 0; j < that.dataRowLen; j++){
            if(that.type==='stacked'){
              //only plus data
              if(that.data[j][i]>0){
                if(that.data[j][i])_sum += parseFloat(that.data[j][i]);
              }
            } else {
              //stacked% or stackedarea
              if(that.data[j][i])_sum += parseFloat(that.data[j][i]);
            }
          }
          _ary.push(_sum);
          _sum =0;
        }
        return _ary.sort(function(a,b){return b-a})[0];
      },
      getMinSum: function(that){
        //for stacked �ςݏd�˂����ɍŏ��ɂȂ��̍��v�l�����߂�
        var _ary = [];
        var _sum = 0;
        for(var i = 0; i < that.dataColLen; i++){
          for(var j = 0; j < that.dataRowLen; j++){
            if(that.type==='stacked'){
              //only minus data
              if(that.data[j][i]<0){
                if(that.data[j][i])_sum += parseFloat(that.data[j][i]);
              }
            }
          }
          _ary.push(_sum);
          _sum =0;
        }
        return _ary.sort(function(a,b){return a-b})[0];
      },
      aryToPercent: function(ary){
        // �z����̊e�v�f�����̍��v�ɑ΂���p�[�Z���g�ɒu���������z���Ԃ�
        //null����0
        // [1,2,3] => [16.666666666666664, 33.33333333333333, 50]
        var a=0,b=[];
        ary.forEach(function(x, i){ a+=(x||0) });
        ary.forEach(function(x, i){ b.push(((x||0)/a)*100) });
        return b;
      },
      aryToDeg: function(ary){
        // �z����̊e�v�f�����̍��v�ɑ΂���p�xdeg�ɒu���������z���Ԃ�
        // [1,2,3] => [59.999999999999986, 119.99999999999997, 180]
        var b=[];
        var a = this.aryToPercent(ary);
        a.forEach(function(x, i){ b.push(( x/100 ) * 360) });
        return b;
      },
      isMobile: function () {
        //�X�}�[�g�t�H�����ʕ����� android|iphone|ipad|iemobile ��Ԃ�
        var ua = navigator.userAgent.toLowerCase();
        var match = /(android|iphone|ipad|iemobile)/.exec(ua);
        return match ? match[0] : null;
      },
      isArray: function(arg){
        if(typeof arg === 'object' && arg.length >= 0) { arg=null; return true; }
        setTimeout(function(){arg=null;},1000);
        return Object.prototype.toString.call(arg).toLowerCase() === '[object array]';
      },

      bGgradient: function (from,to,start){
        var start = start || 'left'
        return ';'
          +';background-image:'
          +'-webkit-gradient(linear, '+start+' top, '+start+' bottom, color-stop(0, '+from+'), color-stop(.5, '+to+'))'
          +';background-image:-webkit-linear-gradient('+start+', '+from+' 0%, '+to+' 50%)'
          +';background-image:-moz-linear-gradient('+start+', '+from+' 0%, '+to+' 50%)'
          +';background-image:-ms-linear-gradient('+start+', '+from+' 0%, '+to+' 50%)'
          +';background-image:-o-linear-gradient('+start+', '+from+' 0%, '+to+' 50%)'
          +';'
      },
      setBG: function (doms, from, to, start){
        if(doms.nodeType===1){
          doms.style.cssText = ccchart.util.bGgradient(from, to, start);
        } else if(doms.length > 0) {
          for(var i=0;i<doms.length;i++){
            doms[i].style.cssText = ccchart.util.bGgradient(from, to, start);
          }
        }
      },
      getFontSizeFromStyle: function(fontStyle){
        var fontSize = (fontStyle).split(' ')[1]||0;
        return parseFloat(fontSize);
      },
      hCopy: function (oj){ //JSON object�̃n�[�h�R�s�[(���łɕs����JSON���r��)
        return JSON.parse(JSON.stringify(oj));
      },
      /* xbcss.js for CrossBrowser CSS3
       * http://socketapi.com/jsbu/20120206/croscss.htm
       * Update: 2013/04/13
       * Create: 2012/02/06
       * version: 0.35
       * Public domain
       * Toshiro Takahashi @toshirot
       * http://wwtarget.facebook.com/javascripting
       */
      xbcss : {
        enjoy: function(){
          var arg = this.enjoy.arguments;
          if(!this[arg[0].split('(')[0]])return;
          var names = {
            'transform': document.body.style.transform,
            '-webkit-transform': document.body.style.webkitTransform,
            '-moz-transform': document.body.style.MozTransform,
            '-ms-transform': document.body.style.msTransform,
            '-o-transform': document.body.style.OTransform
          };
          var csstext = '';
          for(var i in names){
            if(names[i]!==undefined){
              csstext = i + ':'
              for(var j =0; j < arg.length; j++){
              	csstext+=' '+arg[j]
              }
            }
          }
          return csstext;
        },
        translate: function(tx, ty){
          var arg = (ty)? (tx+','+ty) : (tx+', 0px');
          return 'translate('+arg+') ';
        },
        translateX: function(tx){
          return 'translateX('+tx+')'
        },
        translateY: function(tx){
          return 'translateY('+tx+')'
        },
        scale: function(sx, sy){
          var sy = (sy)? sy : sx;
          return 'scale('+sx+','+sy+')'
        },
        scaleX: function(sx){
          return 'scaleX('+sx+')'
        },
        scaleY: function(sy){
          return 'scaleY('+sy+')'
        },
        skew: function(ax, ay){
          var arg = (ay)? (ax+','+ay) : ax;
          return 'skew('+arg+')'
        },
        skewX: function(ax){
          return 'skewX('+ax+')'
        },
        skewY: function(ay){
          return 'skewY('+ay+')'
        },
        matrix: function(a, b, c, d, tx, ty){
          return 'matrix('+a+','+b+','+c+','+d+','+tx+','+ty+')'
        },
        matrix3d: function(
          m00, m01, m02, m03,
          m10, m11, m12, m13,
          m20, m21, m22, m23,
          m30, m31, m32, m33){

          return 'matrix3d('
            +m00+','+m01+','+m02+','+m03+','
            +m10+','+m11+','+m12+','+m13+','
            +m20+','+m21+','+m22+','+m23+','
            +m30+','+m31+','+m32+','+m33+')'
        },
        rotate: function(angle){
          return 'rotate(' + angle + 'deg)'
        }
      }
    }
  }
})(window);


window.ccchart.m.CssHybrid =
(function(window) {
  return {
    aboutThis_module: {
    name: 'CssHybrid',
    varsion: '0.05',
    create: 20120610,
    update: 20131224,
    dependent: 'ccchart-v1.08.1',
   // demo: 'http://ccchart.com/test/base/base-v1.06-b7.htm',
    writer: 'Toshiro Takahashi @toshirot'
    },
    useCssSetting: function(){
      if (this.useCss !== 'yes') return this;
      if (this.type === 'pie') return this;
      var id = this.id;
      var that = this;

      var style = getComputedStyle(this.canvas);
      var top = getNum('top');
      var left = getNum('left');
      var marginTop = getNum('margin-top');
      var marginLeft = getNum('margin-left');
      var paddingTop = getNum('padding-top');
      var paddingLeft = getNum('padding-left');
      var borderTopWidth = getNum('border-top-width');
      var borderLeftWidth = getNum('border-left-width');
      var currZindex = getNum('z-index');
      var position = style.position;

      var position =
          (position==='relative'||position==='static')?
          'absolute':position;

       this.canvasZindex =
        (this.defaultZindex < currZindex)?
           currZindex: this.defaultZindex;

      var operaTop =
        (this.ua.match(/opera/) && position==='fixed')?(
          getNum('top')
          + Math.max(
          getNum('margin'),
          getNum('margin-top')
          )
      ):0;//operafix

      var operaLeft =
        (this.ua.match(/opera/) && position==='fixed')?(
          getNum('left')
          + Math.max(
          getNum('margin'),
          getNum('margin-left')
          )
      ):0;//operafix

      this.coj[this.id]['adjustTop'] =
        paddingTop + borderTopWidth + operaTop;
      this.coj[this.id]['adjustLeft'] =
        paddingLeft + borderLeftWidth + operaLeft;

      //CSS�v�f�p�f�t�H���g�X�^�C���pstyle�v�f����
      this.coj[this.id].TMP_tooltipIni = ''
        //+ '{'
        + ';position: absolute'
        + ';top: -10000px'
        + ';left: -10000px'
        //+ '}';
      this.coj[this.id].TMP_tooltip = ''
       // + '{'
        + ';width:120px'
        + ';height:40px'
        + ';box-shadow: 6px 6px 6px rgba(000,000,000,0.6), inset 2px 2px 3px 3px rgba(180,180,180,0.2)'
        + ';border: 1px solid rgba(180,180,180,0.7)'
        + ';border-radius: 12px'
        + ';font-size: 10px'
        + ';line-height: 11px'
        + ';padding-top: 5px'
        + ';text-align: center'
        + ';text-shadow: 0px;'
       // + '}';
      this.coj[this.id].TMP_tooltip_fukidashi = ''
        + '{'
        + ';content: " "'
        + ';position: absolute'
        + ';z-index: 2'
        + ';left: 20px'
        + ';top: 45px'
        + ';background: transparent'
        + ';border : 12px solid'
        + ';border-color: rgba(200,200,200,0.9) transparent transparent;'
        + '}';

      var cssText = ''; //CSS�p�X�^�C���v�f�p������

      //CSS�p�X�^�C���v�f��id�ʂ̃X�^�C���v�f����
      this.hybridCssEl =
        document.querySelector('#-ccchart-css-styles');
      this.hybridCss = getHybridCss();//document.styleSheets['-ccchart-css-styles'];

      //CSS�p�X�^�C���v�f��������΍쐬����
      if(this.hybridCssEl=== null){
        this.hybridCssEl= document.createElement('style');
        this.hybridCssEl.setAttribute('id', '-ccchart-css-styles');
        this.hybridCssEl.setAttribute('title', '-ccchart-css-styles');

        cssText+='\n.-ccchart-css-arc{background-color: rgba(0,0,0,0.5);}';
        cssText+='\ndiv.-ccchart-css-arc:hover{';
        cssText+='  box-shadow: 0px 0px 30px rgba(255,255,255,1);';
        cssText+='  background-color: rgba(255,255,255,0.5);';
        cssText+='}';
        cssText+='\n.line{border-top: 1px solid #000;}';
        cssText+='\ndiv.line:hover{';
        cssText+='  box-shadow: 0px 0px 30px rgba(255,255,255,1);';
        cssText+='  background-color: rgba(255,255,255,0.5);';
        cssText+='}';
        cssText+='\n\n';

      }

      //�c�[���`�b�v��CSS�ݒ� cssTooltip�Ƃ��̐����o����config�ݒ�
      this.cssTooltip = this.op.config.cssTooltip || this.gcf.cssTooltip || '';
      this.cssTooltipFukidashi = this.op.config.cssTooltipFukidashi || this.coj[this.id].TMP_tooltip_fukidashi;

      //���Yid�� css group ���܂���������Ă��Ȃ����CSS������𐶐�����
      if(!this.cssgs[this.id]){

        if(!(this.op.config.cssTooltip || this.gcf.cssTooltip)){
          //config�ݒ肪������΃f�t�H���g��cssTooltip�e���v���[�g��K�p����
          cssText+= '\n.-ccchart-css-tooltip {' + this.coj[this.id].TMP_tooltipIni +'}';
          cssText+= '\n #-ccchart-css-tooltip-' + this.id + '{' + this.coj[this.id].TMP_tooltip +'}';
        } else {
          //config�ݒ肪����΁A����𕶎��񉻂��ēK�p����
          var css = '';
          if(typeof this.cssTooltip === 'object'){
            css = '{';
            for(var i in this.cssTooltip){
              css +=  ';' + i + ':' +  this.cssTooltip[i];
            }
            css += '}';

          } else if(typeof this.cssTooltip === 'string'){
            css += this.cssTooltip;
          }
          cssText+= '\n.-ccchart-css-tooltip {' + this.coj[this.id].TMP_tooltipIni +'}';
          cssText+= '\n #-ccchart-css-tooltip-' + this.id +  (css);
        }
        cssText+= '\n.-ccchart-css-tooltip:before ' + this.cssTooltipFukidashi;
      }

      this.hybridCssEl.innerHTML += cssText;
      //�w�b�_�ւ���style�v�f��ǋL����
      document.head.appendChild(this.hybridCssEl);
      cssText='';
      this.hybridCssEl = null;

      //you will be set ccchart.hybridCss.insertRule( ".hoo { color: #888; }")
      this.hybridCss = document.styleSheets['-ccchart-css-styles'];
          // this.hybridCss = document.styleSheets[0];

      //�n�C�u���b�hCSS�v�f��div�R���e�i����
      this.hybridBox =
        document.querySelector('#-ccchart-css-hybrid')
      if (this.hybridBox === null) {
        var hybridBox = document.createElement('div');
        hybridBox.setAttribute('id', '-ccchart-css-hybrid');
        this.hybridBox = document.body.appendChild(hybridBox);
      }

      //css group�p�v�f
      this.cssgs[id] =
        document.querySelector('#-ccchart-css-group-' + id);
      if(!this.cssgs[id]){
        //CSS�O���[�v�{�b�N�X �ꊇ�폜�p (hybridBox����1�������݂ł��܂�)
        var cssGrpBox = document.getElementById('-ccchart-css-groupbox');
        var cssGrpBox = cssGrpBox?cssGrpBox:document.createElement('div');
        cssGrpBox.setAttribute('id', '-ccchart-css-groupbox');
        //CSS�O���[�v (cssGrpBox���ɕ������݂ł��܂�)
        var cssGrp = document.createElement('div');
        cssGrp.setAttribute('class', '-ccchart-css-group');
        //�܂��A�R���e�ihybridBox�փO���[�v�{�b�N�XcssGrpBox��ǉ�
        this.hybridBox.appendChild(cssGrpBox);
        //�O���[�vcssGrp���O���[�v�{�b�N�XcssGrpBox�֓���Ă���cssgs���X�g�֒ǉ�
        this.cssgs[id] = cssGrpBox.appendChild(cssGrp);
        this.cssgs[id].setAttribute('id', '-ccchart-css-group-' + id);
        cssGrpBox = null;
      }
      var cssText = ''
      cssText += ';width:' + getCvsVal('width', this.width) + 'px';
      cssText += ';height:' + getCvsVal('height', this.height) + 'px';
      cssText += ';position:' + position;
      if (position === 'fixed') {
        var fixedZ = this.canvasZindex + 2;
        cssText += ';z-index:' + ('' + fixedZ);
        this.canvas.style.zIndex = ('' + fixedZ);
      } else cssText += ';z-index:' + (this.canvasZindex + 1);

      //CSS�K�p
      this.cssgs[id].setAttribute('style',
        cssText+';background:transparent;border-color:transparent;'
      );
      //this.hybridBox.addEventListener('DOMNodeInserted',function(e,f){addToolTip(that);})
      if(this.useToolTip==='yes'){
        addToolTip(this);
      }

      return this;

      function addToolTip(that){
        var id = that.id
        //css tooltip�p�v�f

        that.cssTooltips[id] = document.querySelector('#-ccchart-css-tooltip-' + id);
        if(!that.cssTooltips[id]){
          var csstooltip = document.createElement('div');
          csstooltip.setAttribute('class', '-ccchart-css-tooltip');
          csstooltip.setAttribute('id', '-ccchart-css-tooltip-' + id);
          var cssText = ''
          cssText += ';z-index:' + (that.canvasZindex + 1);

          //CSS�R���e�i�֒ǉ�
          //setTimeout���܂��Ȃ��Əo�͂���Ȃ�
          setTimeout(function(){
            that.cssTooltips[id] =
              that.cssgs[id].appendChild(csstooltip);
            try{
              var _tooltipop = that.cssTooltip;
              if(_tooltipop){
                if(!_tooltipop.bgGradient){
                  defaultToolTipBG(id);
                } else {
                  //tooltip��bgGradient���Z�b�g����Ă���ꍇ
                  that.util.setBG(
                    document.querySelectorAll('#-ccchart-css-tooltip-' + id)
                    , _tooltipop.bgGradient.from
                    , _tooltipop.bgGradient.to
                    , 'top'
                  );
                }
              } else{
                defaultToolTipBG(id);
              }
            } catch(e){}

          },0)
        }
      }
      function defaultToolTipBG(id){
        that.util.setBG(
        document.querySelectorAll('#-ccchart-css-tooltip-' + id)
          ,'rgba(200,200,200,0.6)'
          ,'rgba(255,255,255,0.6)'
          , 'top'
        );
      }

      function getHybridCss(){
        var sheet = null;
        for(var i=0;i<document.styleSheets.length;i++){
          if(document.styleSheets[i].title==='-ccchart-css-styles')
          sheet = document.styleSheets[i]; break;
        }
        return sheet
      }

      function getCvsVal(prop,defaultVal){
        return  that.canvas.style[prop]||
          that.canvas.getAttribute(prop)||defaultVal;
      }
      function getComputedStyle(elm){
        return elm.currentStyle ||
          document.defaultView.getComputedStyle(elm, null);
      }
      function getNum(prop){
        return parseFloat(
          document
          .defaultView
          .getComputedStyle(that.canvas, null)
          .getPropertyValue(prop), 10
         )||0;
      }

    },
    adjustCss: function (type){
      var that = this;  //console.log(that.id, that.adjustCss.caller);

      for(var i in this.coj){
        if(that.coj[i].useCss !== 'yes')continue;
        var el =document.getElementById(i);
        var level = 0;
        var group = document.getElementById("-ccchart-css-group-"+i);
        if(!group)return;

        getPos(i, el, level, 10, 0, 0,
          function(numAry){
            var topOff =  that.coj[i]['adjustTop']
            var leftOff = that.coj[i]['adjustLeft']
            var top = topOff + numAry[0]||0;
            var left = leftOff + numAry[1]||0;
            group.style.top = top+'px';
            group.style.left = left + 'px';
          }
        );
      }

      //Dom Tree��k�サ��pos�𒲐�����
      //see http://d.hatena.ne.jp/elm200/touch/20080203/1202009300
      //see http://d.hatena.ne.jp/susie-t/20061004#200610041723
      // i support this without ie. e.g. marquee, map, ...
      function getPos(id, el, level, deep, numT, numL, fn){
        var current = el.nodeName.toUpperCase();
        if(current === 'BODY')return;
        if(!deep)var deep = 5;
        var css = el.currentStyle || document.defaultView.getComputedStyle(el, null);
        var parentoffNode = el.offsetParent||el.parentNode;
        if(!parentoffNode)return;

        if(css){

          if(!that.coj[id].targetPos){
            //�^�[�Q�b�g�L�����o�X�� position ���L�^����
            that.coj[id].targetPos = css['position'];
          }

          //�^�[�Q�b�g�L�����o�X position ���̕��򏈗�
          if(that.coj[id].targetPos === 'fixed'){
            if(current === 'CANVAS'){
              numT += el['offsetTop']
              numL += el['offsetLeft']
            }
          } else if(
            that.coj[id].targetPos==='static' ||
            that.coj[id].targetPos==='relative' ||
            that.coj[id].targetPos==='absolute'
          ){
            if(
              current === 'CAPTION' ||
              current === 'TD' ||
              current === 'TH' ||
              current === 'TABLE'
            ){
             var borderTopW = parseInt(css['borderTopWidth'], 10);
             var borderLeftW = parseInt(css['borderLeftWidth'], 10);
             var syusei = that.ua.match(/firefox/)?2:1;

              numT += el['offsetTop'] + borderTopW/syusei;
              numL += el['offsetLeft'] + borderLeftW/syusei;

            } else {
              numT += el['offsetTop'];
              numL += el['offsetLeft'];
            }
          } else {
            //
          }

          if(parentoffNode.nodeName.toUpperCase() === 'BODY'){
            if(fn){
              fn([numT,numL]);
            }
          } else {
            getPos(id, parentoffNode, ++level, deep, numT, numL, fn);
          }
          delete css;
        }
      }
    },
    _css_arc: function(op){
      var that = this;
      var id = this.id;
      if(!op)var op = this.op||{};
      var x = op.x || 0;
      var y = op.y || 0;
      var radius = op.radius || 5;
      var borderWidth = this.borderWidth || 3;
      var colorIndex = ((this.type==='scatter'||this.type==='heatmap')?op.colorIndex:op.row)||0;
      var borderColor = op.borderColor || op.colorSet[colorIndex] || op.colorSet[colorIndex];
      var bgcolor = op.bgColor || op.colorSet[colorIndex] || op.colorSet[colorIndex];
      var tipBgcolor = bgcolor;
      if( (this.type === 'bar' || this.type === 'stacked' ) && this.useToolTip==='yes'){
          bgcolor = (this.barTipAnchorColor === 'colorSet')?bgcolor:this.barTipAnchorColor;
      }
      var etc = (op.etcStyle?op.etcStyle:'');
      var el = document.createElement('div');
      if(borderWidth > radius)radius = borderWidth;//ring��border�������a�𒴂����甼�a���g��

      var dataX = (this.type==='scatter'||this.type==='heatmap')?(this.rowNames[0]):this.colNames[op.col];
      var dataY = (this.type==='scatter'||this.type==='heatmap')?(this.rowNames[1]):this.rowNames[op.row];

      var unit = that.coj[id].unit
      if(typeof unit==='string'){
        unit = unit;
      } else if(typeof unit==='object'){
        unit = unit.unit;
      }

      //CSS�ʒu����
      if(
        (this.dataRowLen-1)===op.row &&
        (this.dataColLen-1)===op.col
      ){
        this.adjustCss('adjusting');
        var _cnt = 0;
        var _tid = setInterval(function () {
          if (_cnt >= 5) clearInterval(_tid);
          that.adjustCss('adjusting');
          _cnt++;
        }, 200);
      }

      //�}�[�J�[�̑������Z�b�g
      el.setAttribute('class','-ccchart-css-arc ' + op.classStr);
      el.setAttribute('data-row',op.row);//scatter�ł͏��0
      el.setAttribute('data-col',op.col);
      el.setAttribute('data-colname',this.colNames[op.col]);
      el.setAttribute('data-colnamestitle',this.colNamesTitle);
      el.setAttribute('data-y', dataY);
      el.setAttribute('data-x',dataX);
      el.setAttribute('data-scatter-y', op.scatterY);
      el.setAttribute('data-scatter-x',op.scatterX);
      el.setAttribute('data-data',op.data);
      el.setAttribute('data-percent',op.percent);
      el.setAttribute('data-unit',op.unit);
      el.setAttribute('data-bg',tipBgcolor);
      var xyr = ''
          + 'position: absolute;'
          + 'left:'+( x - radius )+'px;'
          + 'top:'+( y - radius )+'px;'
          + 'width:'+radius*2+'px;'
          + 'height:'+radius*2+'px;'
          + 'border-radius:'+radius*2+'px;'
          + ((this.type==='bar')?'opacity: 0.5;':'')
          + ((op.classStr==='css-maru')?('background: ' + bgcolor +';'):'')
          + ((op.classStr==='css-ring')?('border:'+borderWidth+'px solid ' + borderColor + ';'):'')
          + 'box-sizing: border-box;'
          +  this.pfx['transform-origin'] +': 0px 0px;'
          +  this.pfx['box-sizing'] +': border-box;'
          +  this.pfx['transition'] +': background-color 200ms linear';
      el.setAttribute('style', xyr+etc);
      //�}�[�J�[���O���[�v�֓o�^
      var arc = this.cssgs[id].appendChild(el);
      el = null;

      function showTooltip(id, e, op){
        that.csstoolRock = !!that.csstoolRock;
        var rowNum = e.target.getAttribute('data-row');
        var rowName = e.target.getAttribute('data-y');
        var colName = e.target.getAttribute('data-x');
        var scatterXData = e.target.getAttribute('data-scatter-x');
        var scatterYData = e.target.getAttribute('data-scatter-y');
        var colname = e.target.getAttribute('data-colname');
        var colnamestitle = e.target.getAttribute('data-colnamestitle');
        var data = e.target.getAttribute('data-data');
        var percent = (that.percentVal === 'yes')?'( ' + e.target.getAttribute('data-percent') + ' )':'';
        var unit = e.target.getAttribute('data-unit');
        var bgcolor = e.target.getAttribute('data-bg');
        var colNamesTitle = (this.type==='scatter'||this.type==='heatmap')?
             '':((that.colNamesTitle)?that.colNamesTitle:'');
        var unit = that.coj[id].unit
        if(typeof unit==='string'){
          unit = unit;
        } else if(typeof unit==='object'){
          unit = unit.unit;
        }

        //this.tmpToolTip�Ƀe���v���[�g����
        var toolTemp = !that.coj[id].tmpToolTip?'':
          that.coj[id].tmpToolTip;

        //�J�����g�f�[�^�̕ϐ��u������
        toolTemp = toolTemp
            .replace(/{{colNamesTitle}}/g, '<span class="-ccchart-ttip-colnamestitle">'+colNamesTitle + '</span> ')
            .replace(/{{colName}}/g,      '<span class="-ccchart-ttip-colname">'+colName  + '</span>')
            .replace(/{{rowName}}/g,      '<span class="-ccchart-ttip-rowname">'+rowName + '</span>')
            .replace(/{{data}}/g,         '<span class="-ccchart-ttip-data">' + data + '</span>')
            .replace(/{{unit}}/g,         '<span class="-ccchart-ttip-unit">' + unit + '</span>')
            .replace(/{{percent}}/g,      '<span class="-ccchart-ttip-percent">' + percent + '</span>')

        //toolTemp������̒�����ʂ̃f�[�^�z��𔻕ʂ��A�z��[row+1][col+1]�̒l�ɒu��������
        var re = /{{(\w*)}}/g;
        var res = [];
        var other = [];
        while(res = re.exec(toolTemp)){
          try{
            var _other = eval(res[1]);
            if(typeof _other==='object'){
              toolTemp = toolTemp
                .replace(
                  '{{'+RegExp.$1+'}}'
                 ,'<span class="-ccchart-ttip-'+res[1]+'">'+_other[ (op.row+1) ][ (op.col+1) ]  + '</span>')
            }
          } catch(e){}
        }
        var computedStyle =
          document
            .defaultView
            .getComputedStyle(that.cssTooltips[id], null)
        setTimeout(function(){
          //:before�p�}�[�W������
          if(!computedStyle)return;
          var height = parseFloat(computedStyle.getPropertyValue('height'), 10)||0
          var borderTop = parseFloat(computedStyle.getPropertyValue('border-top'), 10)||0
          var borderBottom = parseFloat(computedStyle.getPropertyValue('border-bottom'), 10)||0
          var paddingTop = parseFloat(computedStyle.getPropertyValue('padding-top'), 10)||0
          var paddingBottom = parseFloat(computedStyle.getPropertyValue('padding-bottom'), 10)||0
          computedStyle = null;

         // console.log(that.cssTooltips[id],height, borderTop, borderBottom, paddingTop, paddingBottom)

          //�c�[���`�b�v�̈ʒu����
          that.cssTooltips[id].style.left = ( x - radius -20)+'px';
          that.cssTooltips[id].style.top = ( y - radius - 70 - height)+'px';
          that.hybridCss.insertRule(
              '#-ccchart-css-tooltip-'+id+':before {top:'+ ((borderBottom + paddingTop + paddingBottom)  + height) +'px}', 0
          )
        }, 0);
        //�c�[���`�b�v�̃f�t�H���gHTML�e���v���[�g
        //.-ccchart-ttip-data�Ȃǂ�CSS����w��\�ł�
        if(that.type==='scatter'||that.type==='heatmap'){
          var htm = ''
          + '<span class="-ccchart-ttip-sct-colnamestitle"></span>'+ '<br>'
          + '<span class="-ccchart-ttip-sct-colname">'+colName + '</span>' + ' '
          + '<span class="-ccchart-ttip-sct-data-x">'+scatterXData + '</span>'+'<br>'
          + '<span class="-ccchart-ttip-sct-rowname">'+rowName + '</span>' + ' '
          + '<span class="-ccchart-ttip-sct-data-y">'+scatterYData + '</span>'+ '<br>'

          that.cssTooltips[id].innerHTML = htm;
        } else {
          var htm = ''
          + '<span class="-ccchart-ttip-colnamestitle">'+colNamesTitle + '</span>' + ' '
          + '<span class="-ccchart-ttip-colname">'+colName  + '</span>'+'<br>'
          + '<span class="-ccchart-ttip-rowname">'+rowName + '</span>'+ '<br>'
          + '<span class="-ccchart-ttip-data">' + data + '</span>'+ ( ' ' + unit + '' ||'')
          + '<span class="-ccchart-ttip-percent"> ' + percent + ' </span>'

          //op.config.tmpToolTip������΂�����g�p���A������΃e���v���[�g
          if(that.cssTooltips[id])
            that.cssTooltips[id].innerHTML = toolTemp || htm;
            toolTemp = htm = '';
        }
        //�����Z���N�^�̃��[�������������U��������::before�����̐����o���̐F��ݒ�
        that.deleteCssRule('#-ccchart-css-tooltip-'+id+'::before');
        that.hybridCss.insertRule(
          '#-ccchart-css-tooltip-'+id+':before{'
          +' border-color:'
          + bgcolor
          +' transparent transparent;'
          +'}',
          that.hybridCss.cssRules.length
        );
      }
      function hideTooltip(id){
        if(that.csstoolRock)return;
        if(that.cssTooltips[id]){
          that.cssTooltips[id].style.left = -10000 +'px';
          that.cssTooltips[id].style.top = -10000 +'px';
          that.cssTooltips[id].innerHTML = '';
        }
      }

      //�c�[���`�b�v
      if(this.useToolTip==='yes'){

        //Cross Event type
        var mbl = this.util.isMobile();
        var over = (mbl)?'touchstart':'mouseover';
        var out = (mbl)?'touchend':'mouseout';

        //�G�������̃C�x���g�o�^ 1)�G�����猻��A�����܂ŏ����Ȃ�
        arc.addEventListener(over, function(e){ showTooltip(id, e, op) } );

        //���ꂽ���̃C�x���g�o�^ 2)0.5�b��ɏ�����
        arc.addEventListener(out,  function(){
          setTimeout(function(){
            if(!that.csstoolRock)hideTooltip(id);
          },500);
        });
        //�g�O���ȃ��b�N�o�^ �_�u���N���b�N�ŏ����Ȃ��Ȃ� �ă_�u���N���b�N�ŉ���
        arc.addEventListener('dblclick',  function(){
          if(that.csstoolRock)that.csstoolRock = false;
          else that.csstoolRock = true
        });
      }

      return el;
    },
    css_ring: function(op){
      op.classStr = 'css-ring';
      this._css_arc(op);
    },
    css_maru: function(op){
      op.classStr = 'css-maru';
      this._css_arc(op);
    },
    css_lineTo:  function(op){
      op.classStr = 'css_lineTo';
      op.bgColor = op.bgColor || this.colorSet[op.row];
      //  this._css_arc(op);
    },
    deleteCssRule: function(selectorText){
      for(var i=0; i<this.hybridCss.cssRules.length;i++){
        if(this.hybridCss.cssRules[i].selectorText===selectorText){
          this.hybridCss.deleteRule(i)
        }
      }
    }
  }

})(window);
window.ccchart.m.Theme = {

  //����theme�I�u�W�F�N�g�Ƀx�[�X�e�[�}�̃v���p�e�B���Z�b�g�����
  //���̃X�N���v�g���ǂݍ��܂ꂽ�y�[�W�̃f�t�H���g�l�Ƃ��ċ@�\���܂�

  aboutThis_module: {
    name: 'Theme',
    varsion: '0.01',
    create: 20131224,
    dependent: 'ccchart-v1.08.1',
   // demo: 'http://ccchart.com/test/base/base-v1.06-b7.htm',
    writer: 'Toshiro Takahashi @toshirot'
  },

  white: {
    "config": {
      "bg": "#fff",
      "colorSet": ["red", "#FF9114", "#3CB000", "#00A8A2", "#0036C0", "#C328FF", "#FF34C0"],
      "xColor": "rgba(180,180,180,0.3)",
      "yColor": "rgba(180,180,180,0.3)",
      "textColors": {
        "title": "#777",
        "subTitle": "#777",
        "x": "#999",
        "y": "#999",
        "hanrei": "#777",
        "unit": "#777",
        "memo": "#666"
      },
      "shadows": {
        "hanrei": ["#ccc", 5, 5, 5],
        "xline": ["#ccc", 7, 7, 5],
        "line": ["#ccc", 5, 5, 5],
        "bar": ["#ccc", 5, 5, 5],
        "stacked": ["#ccc", 5, -5, 5],
        "stackedarea": ["#ccc", 5, 5, 5],
        "bezi": ["#ccc", 5, 5, 5],
        "bezi2": ["#ccc", 5, 5, 5]
      }
    }
  },
  black: {
    "config": {
      "bg": "#000",
      "colorSet": ["red", "#FF9114", "#3CB000", "#00A8A2", "#0036C0", "#C328FF", "#FF34C0"],
      "xColor": "rgba(180,180,180,0.6)",
      "yColor": "rgba(180,180,180,0.6)",
      "textColors": {
        "title": "#777",
        "subTitle": "#777",
        "x": "#999",
        "y": "#999",
        "hanrei": "#777",
        "unit": "#777",
        "memo": "#666"
      },
      "shadows": {
        "hanrei": ["#222", 5, 5, 5],
        "xline": ["#222", 7, 7, 5],
        "line": ["#222", 5, 5, 5],
        "bar": ["#222", 5, 5, 5],
        "stacked": ["#222", 5, -5, 5],
        "stackedarea": ["#222", 5, 5, 5],
        "bezi": ["#222", 5, 5, 5],
        "bezi2": ["#222", 5, 5, 5],
        "scatter": ["#222", 5, 5, 5],
        "heatmap": ["#222", 5, 5, 5],
        "pie": ["#222", 5, 5, 5]
      }
    }
  },
  _default: {
    "config": {
      "lineWidth": 2,
      //�w�i�O���f�[�V����
      "bgGradient": {
        "direction": "vertical", //vertical|horizontal
        "from": "#687478",
        "to": "#222"
      },
      //X���̐F Y���̐F
      "xColor": "rgba(180,180,180,0.3)",
      "yColor": "rgba(180,180,180,0.3)",
      //�J���[�Z�b�g
      "colorSet": ["red", "#FF9114", "#3CB000", "#00A8A2", "#0036C0", "#C328FF", "#FF34C0"],
      //������J���[
      "textColors": {
        "title": "#ccc",
        "subTitle": "#ddd",
        "x": "#aaa",
        "y": "#aaa",
        "hanrei": "#ccc",
        "unit": "#aaa",
        "memo": "#ccc"
      },
      //�e "useShadow": "no" �ŉe��\�����Ȃ�
      "shadows": {
        "hanrei": ["#222", 5, 5, 5],
        "xline": ["#444", 7, 7, 5],
        "line": ["#222", 5, 5, 5],
        "bar": ["#222", 5, 5, 5],
        "stacked": ["#222", 5, -5, 5],
        "stackedarea": ["#222", 5, 5, 5],
        "bezi": ["#222", 5, 5, 5],
        "bezi2": ["#222", 5, 5, 5],
        "scatter": ["#222", 5, 5, 5],
        "heatmap": ["#222", 5, 5, 5],
        "pie": ["#222", 5, 5, 5]
      }
    }
  },
  set: function(color){
    var _theme = ccchart.util.cnfExtend( this.white);
    _theme.config.bg = color;
    return _theme;
  }
};

//Pulgin Sample
window.ccchart.m.MyTest = {
  //����
  aboutThis_module: {
    name: 'MyTest',
    varsion: '0.01',
    create: 20140101,
    update: 20140101,
    dependent: 'ccchart-v1.08+',
    howtouse: '',
    demo: 'http://ccchart.org/test/module/test-1.htm',
    Author: 'Toshiro Takahashi @toshirot'
  },
  mytest: {
    log: function (msg) {
      console.log(msg);
    },
    alert:  function (msg) {
      alert(msg);
    }
  }
};
