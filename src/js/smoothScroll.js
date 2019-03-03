/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */

export function smoothScroll() {
  'use strict';
  let anc = document.getElementsByTagName('a');
  let ancLength = anc.length;
  let i = 0;
  let pageInnerAncList = [];
  const firstFocusableElement = document.querySelector('a, area, input, button, select, option, textarea, output, summary, video, audio, object, embed, iframe');

  // ページ内リンクの要素を取得
  for (; i < ancLength; i++) {
    let ancHref = anc[i].getAttribute('href');
    if (ancHref.match(/^#/)) {
      pageInnerAncList.push(anc[i]);
    }
  }

  // 機能実行
  pageInnerAncList.forEach( i => {
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
          let startPosition = window.pageYOffset || window.scrollY; // クリックした時の縦軸の座標
          let targetPosition = null; // ページ内リンクかトップへのリンクかにより変動するため宣言のみ行う
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
              next = self.easing(elapsedTime, startPosition, targetPosition, self.duration);
              window.scrollTo(0, next);
              requestAnimationFrame(move);
            }).then( () => {
              isScroll = false; // 連打対策解除

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
