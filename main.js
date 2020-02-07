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
    }
}





// ===== ===== MODEL ===== =====
const Map = {
    edges: [],
    pointer: new Pointer(0, 0)
}

Map.edges.push(new Edge(100, 300, 700, 200));
Map.edges.push(new Edge(100, 400, 1000, 600));
Map.edges.push(new Edge(100, 100, 500, 700));
Map.edges.push(new Edge(500, 100, 500, 700));

var movingEdge = new Edge(900, 100, 900, 300);
movingEdge.direction = 180;
Map.edges.push(movingEdge);

setInterval(() => {
    movingEdge.direction++;
    movingEdge.x1 = movingEdge.x2 + Math.sin(Math.PI/180 * movingEdge.direction) * 200;
    movingEdge.y1 = movingEdge.y2 + Math.cos(Math.PI/180 * movingEdge.direction) * 200;
}, 50);



// ===== ===== LISTENERS ===== =====
CVS.onmousemove = e => {
    Map.pointer.x = e.clientX;
    Map.pointer.y = e.clientY;
}


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
    CTX.lineWidth = 5;
    CTX.beginPath();
    Map.edges.forEach(e => {
        CTX.moveTo(e.x1, e.y1);
        CTX.lineTo(e.x2, e.y2);
    });
    CTX.stroke();
	

    // rays
    CTX.lineWidth = 0.05;
	CTX.strokeStyle = '#aaaaaa'
	CTX.beginPath();
    var p = Map.pointer;
    for(var i = 0; i < 360; i += 0.05) {
        var x3 = p.x;
        var y3 = p.y;
        var x4 = p.x + Math.sin(Math.PI/180 * i) * 1200
        var y4 = p.y + Math.cos(Math.PI/180 * i) * 1200

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