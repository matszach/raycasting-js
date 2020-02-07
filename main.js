// ===== ===== CONST ===== =====
const CVS = document.getElementById('cnv');
const CTX = CVS.getContext('2d');


// ===== ===== CLASSES ===== =====
class Edge {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    length() {
        return Math.sqrt(
            Math.pow((this.x2 - this.x1), 2) + Math.pow((this.y2 - this.y1), 2)
        );
    }

}


class Pointer {
    constructor(x, y) {
        this.x = x;
        this.y = y;
		this.focused = false;
    }
}





// ===== ===== MODEL ===== =====
const Map = {
    edges: [],
    pointer: new Pointer(0, 0)
}

// random edge generation
for(var i = 0; i < 3 + Math.random() * 4; i++) {
	Map.edges.push(new Edge(Math.random() * 1200, Math.random() * 800, Math.random() * 1200, Math.random() * 800));
}

for(var i = 0; i < 1 + Math.random() * 3; i++) {
	var movingEdge = new Edge(0, 0, Math.random() * 1200, Math.random() * 800);
	movingEdge.direction = 180;
	Map.edges.push(movingEdge);
	var len = Math.random() * 400 + 50
	setInterval((e) => {
		e.direction++;
		e.x1 = e.x2 + Math.sin(Math.PI/180 * e.direction) * len;
		e.y1 = e.y2 + Math.cos(Math.PI/180 * e.direction) * len;
	}, Math.random() * 50 + 25, movingEdge);
}




// ===== ===== LISTENERS ===== =====
CVS.onmousemove = e => {
	let p = Map.pointer;
    p.x = e.clientX;
    p.y = e.clientY; 
	p.focused = e.buttons > 0;
}
CVS.onmousedown = CVS.onmousemove;
CVS.onmouseup = CVS.onmousemove;

// ===== ===== DRAW LOOP ===== =====
setInterval(() => {
	

    // clear
    CTX.clearRect(0, 0, 1200, 800);
	
	// background
	CTX.fillStyle = '#00000f'
	for(var i = 0; i < 12; i++) {
		for(var j = 0; j < 8; j++) {
			if((i + j) % 2 == 0){
				CTX.fillRect(i * 100, j * 100, 100, 100)
			}
		}
	}
	

    // edges
    CTX.strokeStyle = '#ff0000';
    CTX.lineWidth = 10;
    CTX.beginPath();
    Map.edges.forEach(e => {
        CTX.moveTo(e.x1, e.y1);
        CTX.lineTo(e.x2, e.y2);
    });
    CTX.stroke();
	

    // rays
    CTX.lineWidth = 0.05;
	CTX.strokeStyle = '#ffffff'
	CTX.beginPath();
	
    var p = Map.pointer;
	var rayLength = p.focused ? 1200 : 300;
	
    for(var i = 0; i < 360; i += p.focused ? 0.05 : 0.10) {
        var x3 = p.x;
        var y3 = p.y;
        var x4 = p.x + Math.sin(Math.PI/180 * i) * rayLength;
        var y4 = p.y + Math.cos(Math.PI/180 * i) * rayLength;

        var ray = new Edge(x3, y3, x4, y4);

        Map.edges.forEach(e => {
            var x1 = e.x1;
			var y1 = e.y1;
			var x2 = e.x2;
			var y2 = e.y2;
			
			var t_nom = (x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4);
			var u_nom = - ((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3));
            var t_den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
            
            if (t_den == 0) {
                // -> lines parallel
                return;
            }

            var t = t_nom/t_den;
            var u = u_nom/t_den;
            
            if (t >= 1 || t <= 0) {
                // -> common point not on edge
                return;
            } else if(u <= 0) {
                // -> opposite ray side
                return;
            }

            var xCross = x1 + t * (x2 - x1);
            var yCross = y1 + t * (y2 - y1);

            // is clipped ray shorter?
            var clippedRay = new Edge(x3, y3, xCross, yCross);

            if(clippedRay.length() < ray.length()) {
                ray = clippedRay;
                x4 = xCross;
                y4 = yCross;
            }
				
        })
		
		
        CTX.moveTo(ray.x1, ray.y1);
        CTX.lineTo(ray.x2, ray.y2);
		
    }   
	CTX.stroke();


}, 20);