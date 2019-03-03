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

  // ページ内リンクの要素を取得
  for (; i < ancLength; i++) {
    let ancHref = anc[i].getAttribute('href');
    if (ancHref.match(/^#/)) {
      pageInnerAncList.push(anc[i]);
    }
  }

  // 機能実行
  pageInnerAncList.forEach(function (i) {
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

        this.root.addEventListener('click', function (e) {
          e.preventDefault();

          let thisEl = e.target;
          let targetHash = thisEl.getAttribute('href');
          let targetId = targetHash.replace(/^#/, '');
          let target = document.getElementById(targetId);
          let targetPosition = null;
          let startPosition = window.pageYOffset || window.scrollY;
          let elapsedTime = 0;
          let next = null;
          let timeStart = null;

          let move = (timeCurrent) => {
            if (!timeStart) {
              timeStart = timeCurrent;
            }
            if (elapsedTime >= self.duration) {
              return;
            }
            elapsedTime = timeCurrent - timeStart;
            next = self.easing(elapsedTime, startPosition, targetPosition, self.duration);
            window.scrollTo(0, next);
            requestAnimationFrame(move);
          };

          if (target) {
            targetPosition = target.getBoundingClientRect().top;
            history.pushState(null, null, targetHash);
            move();
          } else if (targetHash === '#') {
            targetPosition = `-${startPosition}`;
            history.pushState(null, null, '#top');
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
