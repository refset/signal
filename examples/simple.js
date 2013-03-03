var signal = require("../signal")
var lift = require("../lift")
var lift2 = require("../lift2")

var frameRates = fps(30)
var position = MousePosition()

var main = lift2(frameRates, position, function display(frameRate, pos) {
    return Combination([
        Text(frameRate)
        , Text("[x=" + pos.x + ", y=" + pos.y + "]")
        , Form({ x: pos.x + 20, y: pos.y + 20 }, Text(frameRate))
        //, Form({ x: pos.x , y: pos.y }, Rect({ fill: "red" })) - what it's supposed to be
        , Rect({ id:"redOne" , x: pos.x , y: pos.y , fill: "red" , width: pos.x/3, height: pos.y/3 })// have to make do with this for now
    ])
})

render(main)

function render(input) {
    var surface = document.createElement("div")
    document.body.appendChild(surface)

    input(function render(x) {
        surface.innerHTML = ""

        _render(surface, x)
    })

    function _render(surface, x) {
        var type = x[0]
        if (type === "Text") {
            var div = document.createElement("div")
            div.textContent = x[1]
            surface.appendChild(div)
        } else if (type === "Form") {
            var target = document.createElement("div")
            var pos = x[1]

            target.style.position = "absolute"
            target.style.top = pos.y + "px"
            target.style.left = pos.x + "px"

            _render(target, x[2])

            surface.appendChild(target)
        } else if (type === "Combination") {
            var container = document.createElement("div")
            var children = x[1]

            children.forEach(function (x) {
                _render(container, x)
            })

            surface.appendChild(container)
        } else if (type === "Rect") {
            var params = x[1]     
            var oldSvg = document.getElementById(params.id)        
            
            if(!params.id || !oldSvg)
            {
              oldSvg && oldSvg.parentNode && oldSvg.parentNode.removeChild(oldSvg)
              var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
              var svgEl = document.createElementNS("http://www.w3.org/2000/svg", "rect")
              document.body.appendChild(svg)
              //surface.appendChild(svg) - can't get this working
              svg.appendChild(svgEl)
              svg.id = params.id
            }
            else  svgEl = oldSvg.lastChild
            svgEl.height.baseVal.value = params.height || 30
            svgEl.width.baseVal.value = params.width || 30
            svgEl.style.fill= params.fill || "blue"
            svgEl.x.baseVal.value = params.x
            svgEl.y.baseVal.value = params.y
        }
    }
}

function Combination(list) {
    return ["Combination", list]
}

function Form(pos, shape) {
    return ["Form", pos, shape]
}

function Text(str) { return ["Text", str] }

function Rect(params) { return ["Rect", params] }

function MousePosition() {
    return signal(function (send) {
        document.addEventListener("mousemove", function (ev) {
            send(getXY(ev))
        })
    })

    function getXY(e) {
        var posx = 0;
        var posy = 0;
        if (!e) {
            e = window.event;
        }
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY)  {
            posx = e.clientX + document.body.scrollLeft +
                document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop +
                document.documentElement.scrollTop;
        }
        return { x: posx, y: posy }
    }
}

function fps(x) {
    var frameRate = Math.round(1000.0 / x)

    return signal(function (send) {
        var prev = Date.now()

        setTimeout(tick, frameRate)

        function tick() {
            var curr = Date.now()
            var diff = curr - prev
            prev = curr

            send(diff)

            setTimeout(tick, frameRate)
        }
    })
}
