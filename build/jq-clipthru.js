// Generated by CoffeeScript 1.6.3
(function() {
  (function($) {
    return $.widget("salsita.clipthru", {
      options: {
        method: ['clip', 'clip-path'],
        dataAttribute: 'jq-clipthru',
        simpleMode: false,
        collisionTarget: null,
        cloneOnCollision: false,
        keepClonesInHTML: false,
        removeAttrOnClone: ['id'],
        blockSource: null,
        updateOnScroll: true,
        updateOnResize: true,
        updateOnZoom: true,
        updateOnCSSTransitionEnd: false,
        autoUpdate: false,
        autoUpdateInterval: 100,
        broadcastEvents: true,
        debug: false
      },
      _create: function() {
        this.overlayOffset = null;
        if (this.options.collisionTarget) {
          this.collisionTarget = $(this.element.find(this.options.collisionTarget).get(0));
        } else {
          this.collisionTarget = this.element;
        }
        this.collisionTargetOffset = null;
        this.allBlocks = null;
        this.allClones = null;
        this.collidingBlocks = [];
        return this._initWidget();
      },
      _initWidget: function() {
        var _self;
        _self = this;
        this._getAllBlocks();
        if (this.allBlocks.length > 0) {
          this._logMessage("" + this.allBlocks.length + " blocks found", this.allBlocks);
          this.collisionTarget.addClass("" + this.options.dataAttribute + "-origin");
          this._addIdToBlocks();
          this._attachListeners();
          this._createOverlayClones();
          this.refresh();
          clearInterval(this.autoUpdateTimer != null);
          if (this.options.autoUpdate) {
            return this.autoUpdateTimer = setInterval((function() {
              return _self.refresh();
            }), this.options.autoUpdateInterval);
          }
        } else {
          return this._logMessage('no blocks found');
        }
      },
      _triggerEvent: function(name, data) {
        this.element.trigger(name, [data]);
        return this._logMessage(name, data);
      },
      _logMessage: function(name, args) {
        if (this.options.debug) {
          return console.debug("" + this.options.dataAttribute + ": " + name, args);
        }
      },
      _getAllBlocks: function() {
        var block, blocks, cls, _ref, _results;
        if (this.options.blockSource) {
          _ref = this.options.blockSource;
          _results = [];
          for (cls in _ref) {
            blocks = _ref[cls];
            _results.push((function() {
              var _i, _len, _results1;
              _results1 = [];
              for (_i = 0, _len = blocks.length; _i < _len; _i++) {
                block = blocks[_i];
                $(block).data(this.options.dataAttribute, cls);
                if (this.allBlocks) {
                  _results1.push(this.allBlocks = this.allBlocks.add($(block)));
                } else {
                  _results1.push(this.allBlocks = $(block));
                }
              }
              return _results1;
            }).call(this));
          }
          return _results;
        } else {
          return this.allBlocks = $("[data-" + this.options.dataAttribute + "]");
        }
      },
      _getOverlayOffset: function() {
        this.overlayOffset = this.element.get(0).getBoundingClientRect();
        return this.collisionTargetOffset = this.collisionTarget.get(0).getBoundingClientRect();
      },
      _addIdToBlocks: function() {
        var i, _self;
        i = 0;
        _self = this;
        return this.allBlocks.each(function() {
          $(this).data("" + _self.options.dataAttribute + "-id", i);
          return i++;
        });
      },
      _createOverlayClones: function() {
        var _self;
        _self = this;
        this.allBlocks.each(function() {
          var attr, clone, _i, _len, _ref;
          clone = _self.element.clone();
          if (_self.options.removeAttrOnClone) {
            _ref = _self.options.removeAttrOnClone;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              attr = _ref[_i];
              clone.removeAttr(attr);
            }
          }
          clone.addClass("" + _self.options.dataAttribute + "-clone");
          clone.addClass($(this).data(_self.options.dataAttribute));
          clone.data("" + _self.options.dataAttribute + "-id", $(this).data("" + _self.options.dataAttribute + "-id"));
          if (_self.allClones) {
            return _self.allClones = _self.allClones.add(clone);
          } else {
            return _self.allClones = clone;
          }
        });
        if (this.options.keepClonesInHTML) {
          this.allClones.insertAfter(this.element);
        }
        if (this.options.broadcastEvents) {
          return this._triggerEvent("clonesCreated." + this.options.dataAttribute, this.allClones);
        }
      },
      _updateOverlayClones: function() {
        var _self;
        _self = this;
        this.allClones.each(function() {
          var id;
          id = $(this).data("" + _self.options.dataAttribute + "-id");
          if (_self.collidingBlocks.hasOwnProperty(id)) {
            if (_self.options.keepClonesInHTML) {
              $(this).css({
                display: _self.element.css('display')
              });
            } else {
              if (!document.body.contains(this)) {
                $(this).insertAfter(_self.element);
              }
            }
            _self._clipOverlayClone(this, _self._getCollisionArea(_self.collidingBlocks[id]));
            if (_self.options.simpleMode === 'vertical') {
              return _self._clipOverlayOriginal(_self._getRelativeCollision(_self.collidingBlocks[id]));
            }
          } else {
            if (_self.options.keepClonesInHTML) {
              return $(this).css({
                display: 'none'
              });
            } else {
              return $(this).detach();
            }
          }
        });
        if (this.collidingBlocks.length === 0) {
          return this.element.css({
            'clip': 'rect(auto auto auto auto)'
          });
        }
      },
      _getCollisionArea: function(blockOffset) {
        var clipOffset;
        clipOffset = [];
        clipOffset.push(this.overlayOffset.height - (this.overlayOffset.bottom - blockOffset.top));
        clipOffset.push(blockOffset.right - this.overlayOffset.left);
        clipOffset.push(blockOffset.bottom - this.overlayOffset.top);
        clipOffset.push(this.overlayOffset.width - (this.overlayOffset.right - blockOffset.left));
        return clipOffset;
      },
      _getRelativeCollision: function(blockOffset) {
        var clipOffset;
        clipOffset = [];
        if (this.collisionTargetOffset.top <= blockOffset.top) {
          clipOffset.push(0);
          clipOffset.push(blockOffset.top - this.overlayOffset.top);
        } else if (this.collisionTargetOffset.bottom >= blockOffset.bottom) {
          clipOffset.push(this.overlayOffset.height - (this.overlayOffset.bottom - blockOffset.bottom));
          clipOffset.push(this.overlayOffset.bottom);
        } else {
          clipOffset = [0, 0];
        }
        return clipOffset;
      },
      _getCollidingBlocks: function() {
        var _self;
        _self = this;
        this.collidingBlocksOld = this.collidingBlocks;
        this.collidingBlocks = [];
        return this.allBlocks.each(function() {
          var blockOffset, wasCollidedBefore;
          wasCollidedBefore = _self.collidingBlocksOld.hasOwnProperty($(this).data("" + _self.options.dataAttribute + "-id"));
          blockOffset = this.getBoundingClientRect();
          if ((blockOffset.bottom >= _self.collisionTargetOffset.top) && (blockOffset.top <= _self.collisionTargetOffset.bottom) && (blockOffset.left <= _self.collisionTargetOffset.right) && (blockOffset.right >= _self.collisionTargetOffset.left)) {
            _self.collidingBlocks[$(this).data("" + _self.options.dataAttribute + "-id")] = blockOffset;
            if (_self.options.broadcastEvents && !wasCollidedBefore) {
              return _self._triggerEvent("collisionStart." + _self.options.dataAttribute, this);
            }
          } else if (_self.options.broadcastEvents && wasCollidedBefore) {
            return _self._triggerEvent("collisionEnd." + _self.options.dataAttribute, this);
          }
        });
      },
      _clipOverlayClone: function(clone, offset) {
        if (this.options.simpleMode === 'vertical') {
          return $(clone).css({
            'clip': "rect(" + offset[0] + "px auto " + offset[2] + "px auto)"
          });
        } else {
          return $(clone).css({
            'clip': "rect(" + offset[0] + "px " + offset[1] + "px " + offset[2] + "px " + offset[3] + "px)"
          });
        }
      },
      _clipOverlayOriginal: function(offset) {
        return this.element.css({
          'clip': "rect(" + offset[0] + "px auto " + offset[1] + "px auto)"
        });
      },
      _attachListeners: function() {
        var _self;
        _self = this;
        $(window).on("" + (this.options.updateOnResize ? 'resize.' + this.options.dataAttribute : void 0) + " " + (this.options.updateOnScroll ? 'scroll.' + this.options.dataAttribute : void 0), function() {
          return _self.refresh();
        });
        if (this.options.updateOnCSSTransitionEnd) {
          return this.element.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function(event) {
            if (event.originalEvent.propertyName === _self.options.updateOnCSSTransitionEnd) {
              return _self.refresh();
            }
          });
        }
      },
      refresh: function() {
        this._getOverlayOffset();
        this._getCollidingBlocks();
        return this._updateOverlayClones();
      },
      destroy: function() {
        $(window).off("resize." + this.options.dataAttribute + " scroll." + this.options.dataAttribute);
        this.element.off();
        clearInterval(this.autoUpdateTimer);
        this.element.css({
          'clip': 'auto auto auto auto'
        });
        this.allClones.remove();
        this.allBlocks = null;
        this.allClones = null;
        this.overlayOffset = null;
        this.collisionTarget = null;
        this.collisionTargetOffset = null;
        this.collidingBlocks = null;
        this.collidingBlocksOld = null;
        return this._destroy();
      },
      _destroy: $.noop
    });
  })(jQuery);

}).call(this);

/*
//@ sourceMappingURL=jq-clipthru.map
*/
