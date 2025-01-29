
var loading_Container = document.getElementById("Loading_Container");

var progress = document.createElement("progress");
progress.id = "progress_bar";
loading_Container.appendChild(progress);

progress.value = 0;

var label = document.createElement("p");
label.id = "progress_text";
label.className = "progressText";
label.textContent = "0%";
loading_Container.appendChild(label);

var sub = document.createElement("p");
sub.id = "progress_sub";
sub.className = "sub";
sub.textContent = "Processing";
loading_Container.appendChild(sub);

var loadingScreen = {};

loadingScreen.setProgress = function (loaded, total) {
    progress.value = loaded / total;
    // progress.value = 0.5;
    label.textContent = Math.round((loaded / total) * 100) + "%";
    sub.textContent = loaded + "/" + total;
};

// this happens but atm, with most
// things removed, it's very fast so not seen
loadingScreen.complete = function () {
    loading_Container.classList.toggle("fade");
    const progress_el_a = document.getElementById("progress_bar");
    if(progress_el_a) {
        progress_el_a.remove();
    }
    const progress_el_b = document.getElementById("progress_text");
    if(progress_el_b) {
        progress_el_b.remove();
    }
    const progress_el_c = document.getElementById("progress_sub");
    if(progress_el_c) {
        progress_el_c.remove();
    }
    //loading_Container.removeChild(progress);
    setTimeout(function () {
        loading_Container.style.display = "none";
    }, 1000);
};
