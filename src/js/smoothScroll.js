export function smoothScroll() {
  'use strict';
  let anc = document.querySelectorAll('a[href^="#"]');
  const firstFocusableElement = document.querySelector('a, area, input, button, select, option, textarea, output, summary, video, audio, object, embed, iframe');

  // 機能実行
  anc.forEach( i => {
    setSmoothScroll(i);
  });

  function setSmoothScroll(root, options) {
    if (!root) {
      return;
    }

    let o = {
      duration: 500
    };

    if (options) {
      for (let key in options) {
        o[key] = options[key];
      }
    }

    /**
     * スムーススクロール機能
     * @constructor
     */
    const SmoothScroll = function () {
      this.root = root;
      this.duration = o.duration;
    };

    SmoothScroll.prototype = {
      init: function () {
        this.clickHandler();
      },

      /**
       * イージング関数（easeInQuad）
       * やっていないけど、オプションで拡張可能
       * Copyright © 2001 Robert Penner
       * All rights reserved.
       * https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
       * @param {number} t 経過時間
       * @param {number} b スクロール開始位置
       * @param {number} c スクロール到着位置
       * @param {number} d デュレーション
       * @return {number} 現在のイージング値
       */
      easing: function (t, b, c, d) {
        return c*(t/=d)*t + b;
      },

      clickHandler: function () {
        let self = this;
        let isScroll = false; // 連打対策

        this.root.addEventListener('click', e => {
          e.preventDefault();

          if (isScroll) {
            return;
          }

          let thisEl = e.target;
          let targetHash = thisEl.getAttribute('href');
          let targetId = targetHash.replace(/^#/, '');
          let target = document.getElementById(targetId);
          let startPosition = window.pageYOffset; // クリックした時の縦軸の座標
          let targetPosition = null; // ページ内リンクかトップへのリンクかにより変動するため宣言のみ行う
          let reachingPosition = null; // 最終的な到着地点
          let timeStart = null; // アニメーション開始時間
          let elapsedTime = 0; // アニメーション中の経過時間
          let toTop = false; // ページ内リンクかトップへのリンクか判定
          let next = null; // ポジション移動のためのイージングの数値を代入する変数

          let move = timeCurrent => {
            return new Promise( resolve => {

              // アニメーション開始時間を設定
              if (!timeStart) {
                timeStart = timeCurrent;
              }

              // アニメーション終了時の処理
              if (elapsedTime >= self.duration) {
                // ページ内リンクだった場合のフォーカス処理
                if (target) {
                  target.setAttribute('tabindex', 0);
                  target.focus();
                }
                resolve();
                return;
              }

              elapsedTime = timeCurrent - timeStart;

              // IEチラつき対策
              if (isNaN(elapsedTime)) {
                elapsedTime = 0;
              }

              next = self.easing(elapsedTime, startPosition, targetPosition, self.duration);
              window.scrollTo(0, next);
              requestAnimationFrame(move);
            }).then( () => {
              isScroll = false; // 連打対策解除
              window.scrollTo(0, reachingPosition);

              if (target) { // ページ内リンクの場合のフォーカス処理
                target.removeAttribute('tabindex');
              }

              if (toTop) { // トップへのリンクの場合のフォーカス処理
                firstFocusableElement.focus();
                firstFocusableElement.blur();
              }
            });
          };

          isScroll = true; // 連打対策開始

          if (target) {
            targetPosition = target.getBoundingClientRect().top;
            reachingPosition = targetPosition + window.pageYOffset;
            history.pushState(null, null, targetHash);
            move();
          } else if (targetHash === '#') {
            targetPosition = `-${startPosition}`;
            history.pushState(null, null, '#top');
            toTop = true;
            move();
          } else {
            return;
          }
        }, false);
      }
    };

    const scroll = new SmoothScroll();
    scroll.init();
  }
}
