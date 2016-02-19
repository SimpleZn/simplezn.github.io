(function(exports) {

	/**
	 * 常量
	 */
	var DATA_INDEX = 'data-tab-index', // 控制面板序号

		DEFAULT_STYLE = {
			'overflow': 'hidden',
			'position': 'relative'
		};
	

	/**
	 * Slide 组件
	 * @param {[String]} container [元素 id 钩子]
	 * @param {[Object]} config    [slide 参数选项]
	 */
	function Slide(container, config) {
		this.container = $('#' + container);
		if (!this.container) {
			console.error('请指定容器id');
			return;
		}

		// default config
		var defaultConfig = {
			autoSlide: false,
			effect: '',
			hoverStop: true,
			// viewTime: 0,
			// speed,
			defaultIndex: 0,

			contentClass: 'slide_content',
			pannelClass: 'pannel_content',
			navClass: 'tab_list',
			triggerSelector: 'li',
			leftControlBtnCls: null,
			rightControlBtnCls: null,

			initStyleCallback: null,
			slideBeforeFn: null,
			slideAfterFn: null,
			pannelClickCallback: null,

			// 样式
			selectedClass: 'selected'
		};

		$.extend(this, defaultConfig, config || {});

		// 轮播面板pannel容器
		this.pannelContainer = $('.' + this.contentClass, this.container);

		// 面板pannel
		this.aPannels = $('.' + this.pannelClass, this.pannelContainer);
		this.pannelLength = this.aPannels.length;
		this.endPannelIndex = this.pannelLength - 1;

		// 当前轮播面板序号
		this.curPannelIndex = this.defaultIndex;
		this.curPannelEl = this.aPannels[this.curPannelIndex];

		// 轮播面板tab_list容器
		this.navListContent = $('.' + this.navClass, this.container);
		this.tabListDom = $(this.triggerSelector, this.navListContent);

		// list控制面板 向左|向右 btn 元素
		this.listControlLeftBtn = $('.' + this.leftControlBtnCls, this.container);
		this.listControlRightBtn = $('.' + this.rightControlBtnCls, this.container);

		// init
		this.init();

	}

	Slide.prototype = {
		constructor: Slide,

		/**
		 * 初始化
		 */
		init: function() {
			// 获取当前页面宽高
			this.getPannelContentWH();

			// 样式初始化
			this.styleInit();

			// 初始化控制面板序号
			this.addTabIndex();

			// 事件初始化
			this.eventInit();
		},

		/**
		 * 获取容器、轮播面板元素 宽高
		 */
		getPannelContentWH: function() {
			// 容器宽高
			this.pannelContentWidth = this.container.width();
			this.pannelContentHeight = this.container.height();

			// 面板宽高
			this.pannelWidth = this.aPannels.width();
			this.pannelHeight = this.aPannels.height();
		},

		/**
		 * 轮播面板 样式初始化
		 */
		styleInit: function() {
		 	// 样式初始化时的回调
		 	if (this.initStyleCallback && $.isFunction(this.initStyleCallback)) {
		 		this.initStyleCallback.call(this);
		 	}

		 	// 设置面板pannel样式
		 	this.aPannels.css({ 'float': 'left' });
		 	this.scrollWidth = this.pannelLength * this.pannelWidth;
		 	this.scrollHeight = this.pannelHeight;

		 	// 设置面板容器宽高
		 	this.pannelContainer.css(DEFAULT_STYLE).css({
		 		'width': this.pannelContentWidth,
		 		'height': this.pannelContentHeight
		 	});

		 	// 设置面板自身宽高
		 	this.aPannels.css(DEFAULT_STYLE).css({
		 		'width': this.pannelWidth,
		 		'height': this.pannelHeight
		 	});

		 	// 设置scroll box 默认样式
		 	var scrollBoxClsDef = {
		 		'width': this.scrollWidth,
		 		'height': this.scrollHeight,
		 		'padding': 0,
		 		'margin': 0,
		 		'left': 0,
		 		'top': 0
		 	};

		 	// 如果已经实例化过
		 	if (this.scrollBox) {
		 		this.scrollBox.css(DEFAULT_STYLE).css(scrollBoxClsDef);
		 		return;
		 	}

		 	// 创建scrollBox
		 	this.scrollBox = $('<div>').css(DEFAULT_STYLE).css(scrollBoxClsDef);
		 	this.scrollBox.append(this.aPannels);
		 	this.pannelContainer.append(this.scrollBox);
		},

		/**
		 * 添加控制tab-list面板 序号
		 */
		addTabIndex: function() {
			var i = 0,
				length = this.tabListDom.length;

			for (i; i < length; i++) {
				$(this.tabListDom[i]).attr(DATA_INDEX, i);
			}
		},

		/**
		 * 事件初始化
		 */
		eventInit: function() {
			// 单击tab-list切换轮播
			var _self = this;
			this.tabListDom.on('click', function(ev) {
				var targetEl = $(ev.target).parent(this.triggerSelector),
				 	indexNum = parseInt(targetEl.attr(DATA_INDEX), 10);

				// 重复点击 同一帧去重 优化
				if (indexNum === this.curPannelIndex) {
					return;
				}

				_self.slideChange(indexNum);
			});
		},

		/**
		 * 具体轮播方法
		 * @param  Number   index   面板序号
		 * @param  Function callback 回调方法
		 */
		slideChange: function(index, callback) {
			var index = parseInt(index, 10);
			index = (index >= 0) ? index : null;
			
			// 指定某帧
			if (typeof index == 'number') {
				this.moveBoxLeft = index * this.pannelWidth;
			}

			// 设置控制器样式 状态
			this.tabListChange(index);

		},

		/**
		 * 控制器tab样式状态改变
		 */
		tabListChange: function(index) {
			var tabListIndex = index || this.getPannelIndex();
			this.setTabCls(this.tabListDom[tabListIndex]);
		},

		/**
		 * 获取当前轮播模板元素序号
		 * @return Number index 序号
		 */
		getPannelIndex: function() {
			var tabListIndex = this.moveBoxLeft / this.pannelWidth;
			return tabListIndex <= 0 ? 0 : tabListIndex;
		},

		/**
		 * 改变tab-list控制样式
		 * @param el 当前控制目标dom
		 */
		setTabCls: function(el) {
			this.tabListDom.removeClass(this.selectedClass);
			$(el).addClass(this.selectedClass);
		}

	};

	exports.Slide = Slide;

})(window);