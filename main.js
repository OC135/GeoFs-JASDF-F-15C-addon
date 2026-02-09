// ==UserScript==
// @name         F-15
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  F-15の武器をを追加します。
// @author       yamamofly / AIS1697
// @match        http://*/geofs.php*
// @match        https://*/geofs.php*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        F151: {
            model: "https://OC135.github.io/test6/F1520.glb",
            texture: "" // 元に戻す用のURL（空なら何もしない）
        },
        F152: {
            model: "https://OC135.github.io/test6/F1524.glb",
            texture: "" // 元に戻す用のURL（空なら何もしない）
        },
        F153: {
            model: "https://OC135.github.io/test6/F1525.glb",
            texture: "" // 元に戻す用のURL（空なら何もしない）
        }
    };

    let state = {
        enabled: false,
        currentSkin: 'standard',
        pos: [0, 0, 0],
        rot: [0, 0, 0],
        partName: "uh60_custom_part"
    };

    // --- 改善点：機体の全てのパーツにテクスチャを適用する ---
    function applyBaseTexture(textureUrl) {
        if (!textureUrl || !geofs.aircraft.instance) return;

        // リバリーセレクターと同様のロジック：
        // 機体の全パーツをループし、テクスチャ設定が存在する箇所すべてを書き換える
        geofs.aircraft.instance.definition.parts.forEach((partDef, index) => {
            if (partDef.textures && geofs.aircraft.instance.parts[index]) {
                // geofs.api.changeTexture を使用して実行
                geofs.api.changeTexture(textureUrl, 0, geofs.aircraft.instance.parts[index].object3d);

                // 定義データも書き換えておかないと、カメラ切り替え時に戻ってしまうことがあるため上書き
                partDef.textures[0].filename = textureUrl;
            }
        });
        console.log("Livery texture applied to all parts: " + textureUrl);
    }

    function spawnModel(skinType) {
        if (!state.enabled) return;
        if (geofs.aircraft.instance.parts[state.partName]) {
            geofs.aircraft.instance.parts[state.partName].object3d.destroy();
        }
        geofs.aircraft.instance.addParts([{
            "name": state.partName,
            "model": CONFIG[skinType].model,
            "position": state.pos,
            "rotation": state.rot
        }]);
    }

    function updateAppearance(skinType) {
        state.currentSkin = skinType;
        if (state.enabled) {
            spawnModel(skinType);
            applyBaseTexture(CONFIG[skinType].texture);
        }
    }

    function injectUI() {
        if (document.getElementById("uh60-tab-btn")) return;
        let bar = document.querySelector(".geofs-ui-bottom");
        if (!bar) return;

        let btn = document.createElement("button");
        btn.id = "uh60-tab-btn";
        btn.className = "mdl-button mdl-js-button geofs-f-standard-ui";
        btn.innerHTML = "WEAPON";
        btn.style.color = "#F5C542";
        btn.onclick = () => {
            let p = document.getElementById("uh60-panel");
            p.style.display = (p.style.display === "none") ? "block" : "none";
        };
        bar.appendChild(btn);

        let panel = document.createElement("div");
        panel.id = "uh60-panel";
        panel.style = "display:none; position:fixed; left:10px; bottom:80px; width:180px; background:rgba(0,0,0,0.9); color:white; padding:15px; border-radius:8px; z-index:10000; border:2px solid #F5C542;";
        panel.innerHTML = `
            <h3 style="margin:0 0 10px 0; font-size:14px; text-align:center;">weapon addon</h3>
            <button id="toggle-uh60" style="width:100%; padding:10px; margin-bottom:10px; cursor:pointer; background:#444; color:white; border:none;">武器表示：OFF</button>
            <hr style="border:0.5px solid #555;">
            <button class="skin-btn" data-skin="F151" style="width:100%; margin-top:10px; padding:8px; cursor:pointer; background:#179724; color:white; border:1px solid #555;">two fuel tank</button>
            <button class="skin-btn" data-skin="F152" style="width:100%; margin-top:10px; padding:8px; cursor:pointer; background:#179724; color:white; border:1px solid #0088cc; font-weight:bold;">three fuel tank</button>
            <button class="skin-btn" data-skin="F153" style="width:100%; margin-top:10px; padding:8px; cursor:pointer; background:#179724; color:white; border:1px solid #0088cc; font-weight:bold;">one fuel tank</button>
        `;
        document.body.appendChild(panel);

        document.getElementById("toggle-uh60").onclick = function() {
            state.enabled = !state.enabled;
            this.innerHTML = state.enabled ? "武器表示：ON" : "武器表示：OFF";
            this.style.background = state.enabled ? "#F5C542" : "#444";
            this.style.color = state.enabled ? "black" : "white";
            if (state.enabled) updateAppearance(state.currentSkin);
            else if (geofs.aircraft.instance.parts[state.partName]) geofs.aircraft.instance.parts[state.partName].object3d.destroy();
        };

        document.querySelectorAll(".skin-btn").forEach(b => {
            b.onclick = function() {
                updateAppearance(this.getAttribute("data-skin"));
            };
        });
    }

    setInterval(() => { if (window.geofs && geofs.aircraft.instance) injectUI(); }, 2000);
})();
