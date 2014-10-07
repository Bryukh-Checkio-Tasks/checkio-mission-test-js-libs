//Dont change it
requirejs(['ext_editor_1', 'jquery_190', 'three.latest'],
    function (ext, $, THREE) {

        var cur_slide = {};

        ext.set_start_game(function (this_e) {
        });

        ext.set_process_in(function (this_e, data) {
            cur_slide = {};
            cur_slide["in"] = data[0];
            this_e.addAnimationSlide(cur_slide);
        });

        ext.set_process_out(function (this_e, data) {
            cur_slide["out"] = data[0];
        });

        ext.set_process_ext(function (this_e, data) {
            cur_slide.ext = data;
        });

        ext.set_process_err(function (this_e, data) {
            cur_slide['error'] = data[0];
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_animate_success_slide(function (this_e, options) {
            var $h = $(this_e.setHtmlSlide('<div class="animation-success"><div></div></div>'));
            this_e.setAnimationHeight(115);
        });

        ext.set_animate_slide(function (this_e, data, options) {
            var $content = $(this_e.setHtmlSlide(ext.get_template('animation'))).find('.animation-content');
            if (!data) {
                console.log("data is undefined");
                return false;
            }

            //YOUR FUNCTION NAME
            var fname = 'checkio';

            var checkioInput = data.in;
            var checkioInputStr = fname + '(' + JSON.stringify(checkioInput) + ')';

            var failError = function (dError) {
                $content.find('.call').html(checkioInputStr);
                $content.find('.output').html(dError.replace(/\n/g, ","));

                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
                $content.find('.answer').remove();
                $content.find('.explanation').remove();
                this_e.setAnimationHeight($content.height() + 60);
            };

            if (data.error) {
                failError(data.error);
                return false;
            }

            if (data.ext && data.ext.inspector_fail) {
                failError(data.ext.inspector_result_addon);
                return false;
            }

            $content.find('.call').html(checkioInputStr);
            $content.find('.output').html('Working...');


            if (data.ext) {
                var rightResult = data.ext["answer"];
                var userResult = data.out;
                var result = data.ext["result"];
                var result_addon = data.ext["result_addon"];

                //if you need additional info from tests (if exists)
                var explanation = data.ext["explanation"];

                var mouseX = 0, mouseY = 0, mouseZ = 0;
                var width = 400;
                var height = 400;
                var windowHalfX = width / 2;
                var windowHalfY = height / 2;

                var scene = new THREE.Scene();

                var camera = new THREE.PerspectiveCamera(100, width / height, 0.1, 100000);

                var renderer = new THREE.WebGLRenderer({ alpha: true });
                renderer.setSize(width, height);
                renderer.setClearColorHex(0xccffff, 1);
                $content.find(".explanation")[0].appendChild(renderer.domElement);

                var colorOrange4 = "#F0801A";
                var colorOrange3 = "#FA8F00";
                var colorOrange2 = "#FAA600";
                var colorOrange1 = "#FABA00";

                var colorBlue4 = "#294270";
                var colorBlue3 = "#006CA9";
                var colorBlue2 = "#65A1CF";
                var colorBlue1 = "#8FC7ED";

                var colorGrey4 = "#737370";
                var colorGrey3 = "#9D9E9E";
                var colorGrey2 = "#C5C6C6";
                var colorGrey1 = "#EBEDED";

                var colorWhite = "#FFFFFF";

                var maze = [
                    [1, 1, 0, 1, 1, 1],
                    [1, 0, 1, 1, 0, 1],
                    [0, 0, 0, 1, 0, 0],
                    [1, 1, 0, 0, 0, 1],
                    [1, 1, 0, 1, 0, 1],
                    [1, 1, 0, 1, 1, 1]
                ];

                //    var maze = [[1]];

                var cell = 20;
                var pad = 0.05 * cell;


                var floorG = new THREE.BoxGeometry(cell * maze.length, cell * maze[0].length, 1);
                var materialFloor = new THREE.MeshBasicMaterial({color: colorBlue1});
                var floor = new THREE.Mesh(floorG, materialFloor);
                floor.position.set(cell * (maze.length - 1) / 2, cell * (maze[0].length - 1) / 2, -2);
                scene.add(floor);


                var mazeObjects = [];
                for (var i = 0; i < maze.length; i++) {
                    var row = [];
                    for (var j = 0; j < maze[i].length; j++) {
                        if (maze[i][j] === 1) {
                            var geometry = new THREE.BoxGeometry(cell - pad * 2, cell - pad * 2, cell);
            //                var geometry = new THREE.BoxGeometry(cell, cell, cell);
                            var materialShape = new THREE.MeshLambertMaterial({color: colorBlue2});
                            var materialEdges = new THREE.MeshBasicMaterial({wireframe: true, color: colorBlue4, wireframeLinewidth: 5});
            //                var cube2 = new THREE.Mesh(geometry, material2);
                            var cubeShape = new THREE.Mesh(geometry, materialShape);
            //                var cubeEdges = new THREE.Mesh(geometry, materialEdges);
            //                cubeEdges.position.set(i * cell - pad, j * cell - pad, cell / 2);
                            cubeShape.position.set(i * cell, j * cell, cell / 2);
                            var edges = new THREE.EdgesHelper(cubeShape, colorBlue4);
                            edges.material.linewidth = 5;
                            scene.add(cubeShape);
            //                scene.add(edges);
            //                scene.add(cubeEdges);
                        }
                    }
                }

                //    var light = new THREE.PointLight(0xffffff, 5, 6 * cell);
                var light = new THREE.DirectionalLight(0xffffff, 1);
                light.position.x = cell * maze.length / 2;
                //    light.position.x = 0;
                light.position.y = cell * maze[0].length / 2;
                light.position.z = 7 * cell;
                scene.add(light);
                //
                //
                //    var light = new THREE.AmbientLight(0xffffff);
                //    scene.add(light);

                camera.position.x = cell * maze.length / 2 - cell / 2;
                camera.position.y = cell * maze[0].length / 2 - cell / 2;
                camera.position.z = 5 * cell;


                //        cube.rotation.x += 1;
                //        cube.rotation.y += 1;

//                var mouseDown = false;
//
//
//                var initialMouseX = 0;
//                var initialMouseY = 0;
//
//                renderer.domElement.addEventListener('mousedown', function (e) {
//                    mouseDown = true;
//                    initialMouseX = event.clientX;
//                    initialMouseY = event.clientY;
//                }, false);
//
//                renderer.domElement.addEventListener('mouseup', function (e) {
//                    mouseDown = false;
//                    mouseX = 0;
//                    mouseY = 0;
//
//                }, false);
//
//                renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
//
//                renderer.domElement.addEventListener('mousewheel', function(e) {
//                    e.preventDefault();
//                    if (camera.position.z > cell * 2 || e.wheelDelta > 0) {
//                        camera.position.z += 2 * (e.wheelDelta / Math.abs(e.wheelDelta));
//                    }
//                }, false);
//
//
//                function onDocumentMouseMove(event) {
//                    if (mouseDown) {
//                        mouseX = ( event.clientX - initialMouseX );
//
//                        mouseY = ( event.clientY - initialMouseY );
//                    }
//
//                }
                var render = function () {

//                    camera.position.x += mouseX * 0.02;
//                    camera.position.y += mouseY * 0.02;
//
//
//                    camera.lookAt(new THREE.Vector3(cell * maze.length / 2 - cell / 2, cell * maze.length / 2 - cell /2, cell));

                    renderer.render(scene, camera);

                    requestAnimationFrame(render);
                };

                render();



                $content.find('.output').html('&nbsp;Your result:&nbsp;' + JSON.stringify(userResult));
                if (!result) {
                    $content.find('.answer').html('Right result:&nbsp;' + JSON.stringify(rightResult));
                    $content.find('.answer').addClass('error');
                    $content.find('.output').addClass('error');
                    $content.find('.call').addClass('error');
                }
                else {
                    $content.find('.answer').remove();
                }
            }
            else {
                $content.find('.answer').remove();
            }


            //Your code here about test explanation animation
            //$content.find(".explanation").html("Something text for example");
            //
            //
            //
            //
            //


            this_e.setAnimationHeight($content.height() + 60);

        });

        //This is for Tryit (but not necessary)
//        var $tryit;
//        ext.set_console_process_ret(function (this_e, ret) {
//            $tryit.find(".checkio-result").html("Result<br>" + ret);
//        });
//
//        ext.set_generate_animation_panel(function (this_e) {
//            $tryit = $(this_e.setHtmlTryIt(ext.get_template('tryit'))).find('.tryit-content');
//            $tryit.find('.bn-check').click(function (e) {
//                e.preventDefault();
//                this_e.sendToConsoleCheckiO("something");
//            });
//        });

        var colorOrange4 = "#F0801A";
        var colorOrange3 = "#FA8F00";
        var colorOrange2 = "#FAA600";
        var colorOrange1 = "#FABA00";

        var colorBlue4 = "#294270";
        var colorBlue3 = "#006CA9";
        var colorBlue2 = "#65A1CF";
        var colorBlue1 = "#8FC7ED";

        var colorGrey4 = "#737370";
        var colorGrey3 = "#9D9E9E";
        var colorGrey2 = "#C5C6C6";
        var colorGrey1 = "#EBEDED";

        var colorWhite = "#FFFFFF";
        //Your Additional functions or objects inside scope
        //
        //
        //


    }
);
