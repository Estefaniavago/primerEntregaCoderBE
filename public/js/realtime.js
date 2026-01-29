const socket = io();

const container = document.getElementById("product-container");

// Render
socket.on("product_list", (products) => {
    container.innerHTML = "";

    products.forEach((p) => {
        const div = document.createElement("div");
        div.classList.add("card");

        div.innerHTML = `
            <h3>${p.title}</h3>
            <p>${p.description}</p>
            <p>💵 $${p.price}</p>
            <p>📦 ${p.stock}</p>
        `;

        container.appendChild(div);
    });
});

// Agregar
document.getElementById("add-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    socket.emit("add_product", data);
    e.target.reset();
});

// Borrar
document.getElementById("delete-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = e.target.id.value;
    socket.emit("delete_product", id);
    e.target.reset();
});
