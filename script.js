// Base info needed
const mlb = window.location.search.substr(1).toUpperCase();
const category_fetch_url =
  "https://api.mercadolibre.com/categories/" + mlb + "?withAttributes=true";

// Getting elements from document
const root_categories_select = document.getElementById(
  "root_categories_select"
);
const category_tree = document.getElementById("category_tree");
const category_name = document.getElementById("category_name");
const childreen_categories = document.getElementById("childreen_categories");
const table_body = document.getElementById("table_body");
const search_button = document.getElementById("search_button");
const search_value = document.getElementById("search_value");

// Includes redirect function to the root_categories_select element
root_categories_select.onchange = () => {
  window.location.search = root_categories_select.value.toString();
};

// Fetching root categories
fetch("https://api.mercadolibre.com/sites/MLB/categories")
  .then((response) => response.json())
  .then((data) => {
    // Creating category options in the root_categories_select element
    data.forEach((category) => {
      const root_categories_option = document.createElement("option");

      root_categories_option.textContent = category.name;
      root_categories_option.value = "?" + category.id;

      root_categories_select.appendChild(root_categories_option);
    });

    // Setting the root category select value
    root_categories_select.value = window.location.search;
  });

//Getting Data
fetch(category_fetch_url)
  .then((response) => response.json())
  .then((data) => {
    // Organizing Data
    const formatted_data = {
      name: data.name,
      path: data.path_from_root,
      children: data.children_categories,
      attributes: data.attributes.reduce((acc, curr) => {
        const attribute = {
          id: curr.id,
          name: curr.name,
          tags:
            curr.tags && Object.keys(curr.tags).length > 0
              ? Object.keys(curr.tags)
              : " - ",
          description: curr.hint || " - ",
          values:
            curr.id === "GTIN"
              ? {
                  id: "GTIN",
                  value: "Validador de Códigos Universais",
                  link: "https://www.mercadolivre.com.br/validador-codigos-universais",
                }
              : curr.values
              ? curr.values
              : " - ",
        };
        acc.push(attribute);
        return acc;
      }, []),
    };

    // USING DATA

    // Updates the category_name element
    category_name.textContent = formatted_data.name;

    // Creates links to the categories in the category path
    formatted_data.path.forEach((category, index) => {
      const category_breadcrumb = document.createElement("a");
      const prefix = index === 0 ? "" : " / ";

      category_breadcrumb.textContent = prefix + category.name;
      category_breadcrumb.href = "?" + category.id;

      category_tree.appendChild(category_breadcrumb);
    });

    // Creates links to the children categories of the current category
    formatted_data.children.forEach((category, index) => {
      const children_category_breadcrumb = document.createElement("a");
      const prefix = index === 0 ? "" : " - ";

      children_category_breadcrumb.textContent = prefix + category.name;
      children_category_breadcrumb.href = "?" + category.id;

      childreen_categories.appendChild(children_category_breadcrumb);
    });

    // Fills the attributes table
    formatted_data.attributes.forEach((attribute) => {
      const row = document.createElement("tr");

      const name_cell = document.createElement("td");
      const tags_cell = document.createElement("td");
      const hint_cell = document.createElement("td");
      const values_cell = document.createElement("td");

      // Attribute Name
      name_cell.textContent = attribute.name;

      // Attribute Tags list
      if (attribute.tags !== " - ") {
        attribute.tags.forEach((tag) => {
          const tag_tag = document.createElement("button");

          tag_tag.textContent = tag;
          tag_tag.id = tag + attribute.id;
          tag_tag.className = "tags_tag";

          tags_cell.appendChild(tag_tag);
        });
      } else {
        tags_cell.textContent = attribute.tags;
      }

      // Attribute description/hint
      hint_cell.textContent = attribute.description;

      // Attribute values
      if (attribute.id === "GTIN") {
        const link_validator = document.createElement("a");

        link_validator.href = attribute.values.link;
        link_validator.textContent = attribute.values.value;

        values_cell.appendChild(link_validator);
      } else if (attribute.values !== " - ") {
        attribute.values.forEach((value) => {
          const tag_value = document.createElement("button");

          tag_value.textContent = value.name;
          tag_value.id = value.id;
          tag_value.className = "value_tag";

          values_cell.appendChild(tag_value);
        });
      } else {
        values_cell.textContent = attribute.values;
      }

      row.appendChild(name_cell);
      row.appendChild(tags_cell);
      row.appendChild(hint_cell);
      row.appendChild(values_cell);

      table_body.appendChild(row);
    });
  })
  .catch((error) => {
    console.error(error);
  });

// Event Listener for search bar
search_button.addEventListener("click", () => {
  if (!search_value.value) return;
  let mlb = "?" + search_value.value || `?`;
  window.location.search = mlb.toString();
});
